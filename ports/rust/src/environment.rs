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

/// The three runtimes do not agree on what this counts, and the aggregator
/// needs one number. Node's `os.cpus().length` reports the host's logical
/// processors; Go's `runtime.NumCPU()` honours CPU affinity; and Rust's
/// `available_parallelism` honours affinity *and* a cgroup CPU quota. On an
/// unrestricted host all three agree, which is why this was not visible
/// here — but under a quota, which is ordinary for a container, Rust would
/// report the allowance, the environment block would differ from
/// TypeScript's, and `aggregateRun` would reject the whole run rather than
/// one field.
///
/// TypeScript is the canonical port, so this reports what it reports: the
/// processor entries the kernel lists, not the share this process may use.
/// `available_parallelism` remains the fallback for platforms with neither
/// file.
fn logical_cpus() -> usize {
    #[cfg(target_os = "linux")]
    {
        if let Ok(content) = fs::read_to_string("/proc/cpuinfo") {
            let count = count_processors(&content);
            if count > 0 {
                return count;
            }
        }
    }
    #[cfg(target_os = "macos")]
    {
        if let Some(count) = command_output("sysctl", &["-n", "hw.logicalcpu"])
            .and_then(|value| value.parse::<usize>().ok())
        {
            if count > 0 {
                return count;
            }
        }
    }
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

/// One entry per `processor:` line, which is how the kernel lists them and
/// what Node counts.
fn count_processors(cpuinfo: &str) -> usize {
    cpuinfo
        .lines()
        .filter(|line| {
            line.split_once(':')
                .is_some_and(|(key, _)| key.trim().eq_ignore_ascii_case("processor"))
        })
        .count()
}

fn command_output(program: &str, arguments: &[&str]) -> Option<String> {
    let output = Command::new(program).args(arguments).output().ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn processors_are_counted_by_their_own_lines() {
        let cpuinfo = "processor\t: 0\nmodel name\t: Example\ncore id\t: 0\n\n\
                       processor\t: 1\nmodel name\t: Example\ncore id\t: 1\n";
        assert_eq!(count_processors(cpuinfo), 2);
        // `core id` and `model name` also carry a colon, and a processor
        // count that picked up either would not match what Node reports.
        assert_eq!(count_processors("model name\t: Example\n"), 0);
        assert_eq!(count_processors(""), 0);
    }

    #[test]
    fn os_release_values_lose_their_quoting() {
        assert_eq!(unquote_os_release_value("\"Ubuntu 24.04.4 LTS\""), "Ubuntu 24.04.4 LTS");
        assert_eq!(unquote_os_release_value("'Ubuntu'"), "Ubuntu");
        assert_eq!(unquote_os_release_value("  Ubuntu  "), "Ubuntu");
        assert_eq!(unquote_os_release_value("\"a\\\"b\""), "a\"b");
    }

    #[test]
    fn the_architecture_and_platform_use_the_names_the_other_ports_use() {
        // Whatever this host is, neither name may be the one only Rust
        // uses: the aggregator compares these strings across ports.
        assert!(!architecture().is_empty());
        assert_ne!(architecture(), "x86_64", "Go and Node both say amd64");
        assert_ne!(architecture(), "aarch64", "Go and Node both say arm64");
        assert_ne!(operating_system(), "macos", "Go and Node both say darwin");
    }
}
