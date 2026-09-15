// Records the compiler that built this runner, so the raw result can name
// it the way the Go runner names `runtime.Version()` and the TypeScript
// runner names `process.version`. Rust has no runtime to ask at execution
// time, so the answer has to be captured while building.

use std::process::Command;

fn main() {
    println!("cargo:rerun-if-env-changed=RUSTC");

    let rustc = std::env::var("RUSTC").unwrap_or_else(|_| "rustc".to_string());
    let output = Command::new(rustc)
        .arg("--version")
        .output()
        .expect("measure-rust build script: `rustc --version` must run");
    let reported = String::from_utf8_lossy(&output.stdout);

    // `rustc --version` prints `rustc <semver> (<hash> <date>)`. The second
    // field is the release, which is the part the report compares against
    // `go1.26.0` and `v24.0.0`.
    let version = reported
        .split_whitespace()
        .nth(1)
        .expect("measure-rust build script: `rustc --version` reported no version");
    println!("cargo:rustc-env=MEASURE_RUSTC_VERSION={version}");
}
