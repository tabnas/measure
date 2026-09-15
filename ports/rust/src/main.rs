// The runner contract: arguments name the config, the benchmark snapshot
// and the profile, exactly one raw result document goes to stdout, and
// everything else goes to stderr.

/// See the note on `mimalloc` in Cargo.toml: this puts the port on the
/// same footing as the other two, which bring their own.
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

mod environment;
mod model;
mod parsers;
mod runner;

use std::collections::HashMap;
use std::process::ExitCode;

use model::Arguments;

fn main() -> ExitCode {
    let raw: Vec<String> = std::env::args().skip(1).collect();
    let arguments = match parse_arguments(&raw) {
        Ok(arguments) => arguments,
        Err(message) => {
            eprintln!("{message}");
            eprintln!(
                "usage: measure-rust --config <path> --benchmarks <path> --profile <name> \
                 --run-id <id> --generated-at <iso8601> --commit <sha> --dirty <true|false> \
                 --host-fingerprint <hex>"
            );
            return ExitCode::from(2);
        }
    };

    let result = match runner::run(&arguments) {
        Ok(result) => result,
        Err(message) => {
            eprintln!("{message}");
            return ExitCode::FAILURE;
        }
    };

    match serde_json::to_string_pretty(&result) {
        Ok(encoded) => {
            println!("{encoded}");
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}

fn parse_arguments(raw: &[String]) -> Result<Arguments, String> {
    let mut values: HashMap<String, String> = HashMap::new();
    let mut index = 0;
    while index < raw.len() {
        let key = &raw[index];
        let name = key
            .strip_prefix("--")
            .ok_or_else(|| format!("invalid runner arguments: {}", raw.join(" ")))?;
        // Both spellings, because the Go runner's flag package accepts both
        // and a future caller should not have to know which one this port
        // was written against.
        if let Some((name, value)) = name.split_once('=') {
            values.insert(name.to_string(), value.to_string());
            index += 1;
            continue;
        }
        let value = raw
            .get(index + 1)
            .ok_or_else(|| format!("missing value for --{name}"))?;
        values.insert(name.to_string(), value.clone());
        index += 2;
    }

    let mut required = |name: &str| -> Result<String, String> {
        values
            .remove(name)
            .ok_or_else(|| format!("missing --{name}"))
    };
    let config = required("config")?;
    let benchmarks = required("benchmarks")?;
    let profile = required("profile")?;
    let run_id = required("run-id")?;
    let generated_at = required("generated-at")?;
    let commit = required("commit")?;
    let dirty = required("dirty")?;
    let host_fingerprint = required("host-fingerprint")?;
    let dirty = match dirty.as_str() {
        "true" => true,
        "false" => false,
        _ => return Err("--dirty must be true or false".to_string()),
    };

    Ok(Arguments {
        config,
        benchmarks,
        profile,
        run_id,
        generated_at,
        commit,
        dirty,
        host_fingerprint,
    })
}
