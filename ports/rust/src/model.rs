// The wire types. Field order here is the field order in the emitted
// document, and `environment::Fingerprint` depends on that: the Go runner
// hashes a struct and the TypeScript runner hashes an object literal, so a
// reordered field would silently change the fingerprint and split a
// single-host run into two.

use serde::{Deserialize, Serialize};
use serde_json::Value as Json;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeasureConfig {
    pub suite_version: String,
    pub profiles: std::collections::HashMap<String, Profile>,
    pub ports: Vec<PortConfig>,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub warmup_ms: u64,
    pub sample_target_ms: u64,
    pub samples: usize,
    pub max_iterations: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PortConfig {
    pub id: String,
    pub label: String,
    pub parser: ParserConfig,
}

#[derive(Debug, Deserialize)]
pub struct ParserConfig {
    pub module: String,
    pub version: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BenchmarkManifest {
    pub id: String,
    pub capability_cases: Vec<CapabilityCase>,
    pub performance_cases: Vec<PerformanceCase>,
}

#[derive(Debug, Deserialize)]
pub struct CapabilityCase {
    pub id: String,
    pub description: String,
    pub input: String,
    pub accept: bool,
    // Absent for rejection cases. `Option` keeps "no expected value" and
    // "expected null" apart, which a bare `Json` would not.
    #[serde(default)]
    pub expected: Option<Json>,
}

#[derive(Debug, Deserialize)]
pub struct PerformanceCase {
    pub id: String,
    pub description: String,
    pub generator: Generator,
}

#[derive(Debug, Deserialize)]
pub struct Generator {
    pub kind: String,
    pub size: usize,
    #[serde(default)]
    pub value: i64,
    #[serde(default)]
    pub pattern: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortResult {
    #[serde(rename = "$schema")]
    pub schema: &'static str,
    pub schema_version: u32,
    pub run: RunMetadata,
    pub port: PortMetadata,
    pub environment: Environment,
    pub methodology: Methodology,
    pub capabilities: Vec<CapabilityGroup>,
    pub measurements: Vec<Measurement>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunMetadata {
    pub id: String,
    pub generated_at: String,
    pub profile: String,
    pub suite_version: String,
    pub repository_commit: String,
    pub repository_dirty: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortMetadata {
    pub id: String,
    pub label: String,
    pub language: &'static str,
    pub runtime: &'static str,
    pub runtime_version: String,
    pub parser_module: String,
    pub parser_version: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Environment {
    pub fingerprint: String,
    pub host_fingerprint: String,
    pub os: String,
    pub os_name: String,
    pub kernel_version: String,
    pub arch: String,
    pub cpu: String,
    pub logical_cpus: usize,
    pub memory_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Methodology {
    pub scope: &'static str,
    pub warmup_ms: u64,
    pub sample_target_ms: u64,
    pub samples: usize,
    pub max_iterations: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CapabilityGroup {
    pub benchmark_id: String,
    pub passed: usize,
    pub total: usize,
    pub cases: Vec<CapabilityResult>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CapabilityResult {
    pub case_id: String,
    pub description: String,
    pub accept_expected: bool,
    pub accepted: bool,
    pub passed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected: Option<Json>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual: Option<Json>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Measurement {
    pub benchmark_id: String,
    pub case_id: String,
    pub description: String,
    pub input: InputIdentity,
    pub iterations_per_sample: usize,
    pub samples: Vec<Sample>,
    pub checksum: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InputIdentity {
    pub bytes: usize,
    pub code_units: usize,
    pub sha256: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Sample {
    pub elapsed_ns: f64,
}

#[derive(Debug)]
pub struct Arguments {
    pub config: String,
    pub benchmarks: String,
    pub profile: String,
    pub run_id: String,
    pub generated_at: String,
    pub commit: String,
    pub dirty: bool,
    pub host_fingerprint: String,
}
