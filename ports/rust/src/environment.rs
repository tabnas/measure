// Host detection. The aggregator refuses a run whose ports disagree about
// the machine, comparing the whole environment block field by field, so
// these functions have to answer exactly what `runtime.GOOS`, `os.cpus()`
// and their neighbours answer on the same host — not merely something
// true. Where Rust's own constants spell a value differently, they are
// translated rather than reported.

use std::fs;
use std::process::Command;

use crate::model::Environment;
use crate::runner::sha256;

pub fn detect(host_fingerprint: &str) -> Environment {
    let os = operating_system();
    let os_name = operating_system_name(&os);
    let kernel_version = kernel_version(&os);
    let arch = architecture();
    let cpu = cpu_model(&arch);
    let logical_cpus = logical_cpus();
    let memory_bytes = total_memory_bytes();

    // Serialized from a struct, not a map: the fingerprint is a hash of
    // this exact key order, matching the Go struct and the TypeScript
    // object literal.
    #[derive(serde::Serialize)]
    #[serde(rename_all = "camelCase")]
    struct FingerprintInput<'a> {
        os: &'a str,
        os_name: &'a str,
        kernel_version: &'a str,
        arch: &'a str,
        cpu: &'a str,
        logical_cpus: usize,
        memory_bytes: u64,
    }
    let fingerprint_input = serde_json::to_string(&FingerprintInput {
        os: &os,
        os_name: &os_name,
        kernel_version: &kernel_version,
        arch: &arch,
        cpu: &cpu,
        logical_cpus,
        memory_bytes,
    })
    .unwrap_or_default();

    Environment {
        fingerprint: sha256(&fingerprint_input),
        host_fingerprint: host_fingerprint.to_string(),
        os,
        os_name,
        kernel_version,
        arch,
        cpu,
        logical_cpus,
        memory_bytes,
    }
}

/// Rust calls Apple's platform `macos`; Go and Node both call it `darwin`,
/// and the environment block has to read the same in all three.
fn operating_system() -> String {
    match std::env::consts::OS {
        "macos" => "darwin".to_string(),
        other => other.to_string(),
    }
}

/// Rust reports the GNU triple's architecture; Go reports its own names and
/// the TypeScript runner already translates Node's to Go's.
fn architecture() -> String {
    match std::env::consts::ARCH {
        "x86_64" => "amd64".to_string(),
        "aarch64" => "arm64".to_string(),
        "x86" => "386".to_string(),
        other => other.to_string(),
    }
}

fn operating_system_name(fallback: &str) -> String {
    for path in ["/etc/os-release", "/usr/lib/os-release"] {
        let Ok(content) = fs::read_to_string(path) else {
            continue;
        };
        for line in content.lines() {
            if let Some(value) = line.strip_prefix("PRETTY_NAME=") {
                let name = unquote_os_release_value(value);
                if !name.is_empty() {
                    return name;
                }
            }
        }
    }
    fallback.to_string()
}

fn unquote_os_release_value(value: &str) -> String {
    let trimmed = value.trim();
    let unquoted = if trimmed.len() >= 2
        && ((trimmed.starts_with('"') && trimmed.ends_with('"'))
            || (trimmed.starts_with('\'') && trimmed.ends_with('\'')))
    {
        &trimmed[1..trimmed.len() - 1]
    } else {
        trimmed
    };
    unquoted.replace("\\\"", "\"").replace("\\\\", "\\")
}

fn kernel_version(fallback: &str) -> String {
    if let Ok(content) = fs::read_to_string("/proc/sys/kernel/osrelease") {
        let version = content.trim();
        if !version.is_empty() {
            return version.to_string();
        }
    }
    if let Some(version) = command_output("uname", &["-r"]) {
        if !version.is_empty() {
            return version;
        }
    }
    fallback.to_string()
}

#[cfg(target_os = "linux")]
fn cpu_model(fallback: &str) -> String {
    if let Some(output) = command_output("lscpu", &[]) {
        if let Some(model) = field_after_colon(&output, "model name") {
            return model;
        }
    }
    if let Ok(content) = fs::read_to_string("/proc/cpuinfo") {
        if let Some(model) = field_after_colon(&content, "model name") {
            return model;
        }
    }
    fallback.to_string()
}

#[cfg(target_os = "macos")]
fn cpu_model(fallback: &str) -> String {
    match command_output("sysctl", &["-n", "machdep.cpu.brand_string"]) {
        Some(model) if !model.is_empty() => model,
        _ => fallback.to_string(),
    }
}

#[cfg(not(any(target_os = "linux", target_os = "macos")))]
fn cpu_model(fallback: &str) -> String {
    fallback.to_string()
}

fn field_after_colon(text: &str, key: &str) -> Option<String> {
    text.lines().find_map(|line| {
        let (name, value) = line.split_once(':')?;
        if !name.trim().eq_ignore_ascii_case(key) {
            return None;
        }
        Some(value.trim().to_string())
    })
}

/// `runtime.NumCPU()` and Node's `os.cpus().length` both report the logical
/// processors this process may run on.
fn logical_cpus() -> usize {
    std::thread::available_parallelism()
        .map(|count| count.get())
        .unwrap_or(1)
}

#[cfg(target_os = "linux")]
fn total_memory_bytes() -> u64 {
    let Ok(content) = fs::read_to_string("/proc/meminfo") else {
        return 1;
    };
    for line in content.lines() {
        let mut fields = line.split_whitespace();
        if fields.next() != Some("MemTotal:") {
            continue;
        }
        if let Some(kilobytes) = fields.next().and_then(|value| value.parse::<u64>().ok()) {
            return kilobytes * 1024;
        }
    }
    1
}

#[cfg(target_os = "macos")]
fn total_memory_bytes() -> u64 {
    command_output("sysctl", &["-n", "hw.memsize"])
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(1)
}

#[cfg(not(any(target_os = "linux", target_os = "macos")))]
fn total_memory_bytes() -> u64 {
    1
}

fn command_output(program: &str, arguments: &[&str]) -> Option<String> {
    let output = Command::new(program).args(arguments).output().ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
