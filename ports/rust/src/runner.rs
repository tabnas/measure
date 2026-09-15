// The measurement loop. It mirrors `ports/go/internal/runner/runner.go` and
// `ports/typescript/src/main.ts` step for step: same warmup, same iteration
// calibration, same checksum arithmetic, same input identity. Anything that
// differs between the three would show up as a divergent number that looks
// like a language result and is not one.

use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
use std::time::{Duration, Instant};

use serde_json::Value as Json;
use sha2::{Digest, Sha256};
use tabnas::{Tabnas, Value};

use crate::environment;
use crate::model::{
    Arguments, BenchmarkManifest, CapabilityGroup, CapabilityResult, InputIdentity, MeasureConfig,
    Measurement, Methodology, PerformanceCase, PortMetadata, PortResult, Profile, RunMetadata,
    Sample,
};
use crate::parsers::make_parser;

const CHECKSUM_MODULUS: i64 = 1_000_000_007;
const PORT_ID: &str = "rust";
const SCHEMA: &str = "https://tabnas.github.io/measure/schemas/port-result.schema.json";

pub fn run(arguments: &Arguments) -> Result<PortResult, String> {
    let config: MeasureConfig = read_json(&arguments.config)?;
    let profile = *config
        .profiles
        .get(&arguments.profile)
        .ok_or_else(|| format!("unknown profile: {}", arguments.profile))?;

    let port = config
        .ports
        .iter()
        .find(|candidate| candidate.id == PORT_ID)
        .ok_or_else(|| format!("the configuration has no {PORT_ID} port"))?;
    if tabnas::VERSION != port.parser.version {
        return Err(format!(
            "configured {} {}, loaded {}",
            port.parser.module,
            port.parser.version,
            tabnas::VERSION
        ));
    }

    let manifests = load_manifests(&arguments.benchmarks)?;
    let mut capabilities = Vec::with_capacity(manifests.len());
    let mut measurements = Vec::new();
    for manifest in &manifests {
        let parser = make_parser(&manifest.id)?;
        capabilities.push(run_capabilities(manifest, &parser));
        for performance_case in &manifest.performance_cases {
            measurements.push(run_measurement(manifest, performance_case, &parser, &profile)?);
        }
    }

    Ok(PortResult {
        schema: SCHEMA,
        schema_version: 3,
        run: RunMetadata {
            id: arguments.run_id.clone(),
            generated_at: arguments.generated_at.clone(),
            profile: arguments.profile.clone(),
            suite_version: config.suite_version.clone(),
            repository_commit: arguments.commit.clone(),
            repository_dirty: arguments.dirty,
        },
        port: PortMetadata {
            id: port.id.clone(),
            label: port.label.clone(),
            language: "Rust",
            runtime: "Rust",
            runtime_version: env!("MEASURE_RUSTC_VERSION").to_string(),
            parser_module: port.parser.module.clone(),
            parser_version: tabnas::VERSION.to_string(),
        },
        environment: environment::detect(&arguments.host_fingerprint),
        methodology: Methodology {
            scope: "parse-only-steady-state-sequential",
            warmup_ms: profile.warmup_ms,
            sample_target_ms: profile.sample_target_ms,
            samples: profile.samples,
            max_iterations: profile.max_iterations,
        },
        capabilities,
        measurements,
    })
}

fn run_capabilities(manifest: &BenchmarkManifest, parser: &Tabnas) -> CapabilityGroup {
    let mut cases = Vec::with_capacity(manifest.capability_cases.len());
    let mut passed = 0;
    for test_case in &manifest.capability_cases {
        let outcome = parser.parse(&test_case.input);
        let accepted = outcome.is_ok();
        let actual = outcome.as_ref().ok().map(canonical_json);
        // Present-and-null is a value to compare against; absent is not.
        let expected = test_case.expected.as_ref().map(|value| match value {
            Some(value) => normalize(value),
            None => Json::Null,
        });
        // Both sides are normalized, so a whole-valued `2.0` from the
        // parser and a `2` in the manifest agree the way they do in the
        // other two ports.
        let case_passed =
            accepted == test_case.accept && (!test_case.accept || actual == expected);
        if case_passed {
            passed += 1;
        }
        cases.push(CapabilityResult {
            case_id: test_case.id.clone(),
            description: test_case.description.clone(),
            accept_expected: test_case.accept,
            accepted,
            passed: case_passed,
            // The manifest's own value, as the other two runners emit it:
            // present when the manifest has the key, null when it says null.
            expected: test_case
                .expected
                .clone()
                .map(|value| value.unwrap_or(Json::Null)),
            actual,
            error: outcome.err().map(|error| clean_error(&error.to_string())),
        });
    }
    CapabilityGroup {
        benchmark_id: manifest.id.clone(),
        passed,
        total: cases.len(),
        cases,
    }
}

fn run_measurement(
    manifest: &BenchmarkManifest,
    performance_case: &PerformanceCase,
    parser: &Tabnas,
    profile: &Profile,
) -> Result<Measurement, String> {
    let input = generate_input(performance_case)?;
    parser.parse(&input).map_err(|error| {
        format!(
            "{}/{} correctness parse: {}",
            manifest.id,
            performance_case.id,
            clean_error(&error.to_string())
        )
    })?;

    let warmup_until = Instant::now() + Duration::from_millis(profile.warmup_ms);
    while Instant::now() < warmup_until {
        parse_or_fail(parser, &input)?;
    }

    let target = Duration::from_millis(profile.sample_target_ms);
    let mut iterations = 1;
    while iterations < profile.max_iterations {
        let (elapsed, _) = time_batch(parser, &input, iterations)?;
        if elapsed >= target {
            break;
        }
        iterations = (iterations * 2).min(profile.max_iterations);
    }

    // The Go and TypeScript runners collect garbage here. Rust frees the
    // previous parse as it goes, so there is no deferred work to flush and
    // nothing to do at this point.
    let mut samples = Vec::with_capacity(profile.samples);
    let mut checksum = 0.0_f64;
    for _ in 0..profile.samples {
        let (elapsed, batch_checksum) = time_batch(parser, &input, iterations)?;
        checksum = ((checksum as i64 + batch_checksum as i64) % CHECKSUM_MODULUS) as f64;
        samples.push(Sample {
            elapsed_ns: elapsed.as_nanos() as f64,
        });
    }

    Ok(Measurement {
        benchmark_id: manifest.id.clone(),
        case_id: performance_case.id.clone(),
        description: performance_case.description.clone(),
        input: input_identity(&input),
        iterations_per_sample: iterations,
        samples,
        checksum,
    })
}

fn time_batch(parser: &Tabnas, input: &str, iterations: usize) -> Result<(Duration, f64), String> {
    let mut checksum = 0_i64;
    let started = Instant::now();
    for _ in 0..iterations {
        let value = parse_or_fail(parser, input)?;
        checksum = (checksum + checksum_value(&value)) % CHECKSUM_MODULUS;
    }
    Ok((started.elapsed(), checksum as f64))
}

fn parse_or_fail(parser: &Tabnas, input: &str) -> Result<Value, String> {
    parser
        .parse(input)
        .map_err(|error| clean_error(&error.to_string()))
}

fn checksum_value(value: &Value) -> i64 {
    match value {
        Value::Number(number) => (*number as i64) % CHECKSUM_MODULUS,
        Value::Bool(flag) => i64::from(*flag),
        other => serde_json::to_string(&canonical_json(other))
            .map(|encoded| encoded.len() as i64)
            .unwrap_or(0),
    }
}

fn generate_input(performance_case: &PerformanceCase) -> Result<String, String> {
    let generator = &performance_case.generator;
    match generator.kind.as_str() {
        "adder-chain" => Ok(vec![generator.value.to_string(); generator.size].join("+")),
        "even-palindrome" => {
            if generator.size == 0 || generator.size % 2 != 0 || generator.pattern.is_empty() {
                return Err(format!(
                    "invalid even-palindrome generator for {}",
                    performance_case.id
                ));
            }
            let half_length = generator.size / 2;
            let pattern_length = generator.pattern.chars().count();
            let repeats = half_length.div_ceil(pattern_length);
            let half: String = generator
                .pattern
                .repeat(repeats)
                .chars()
                .take(half_length)
                .collect();
            let reversed: String = half.chars().rev().collect();
            Ok(format!("{half}{reversed}"))
        }
        kind => Err(format!("unknown generator kind: {kind}")),
    }
}

fn load_manifests(directory: &str) -> Result<Vec<BenchmarkManifest>, String> {
    let entries = fs::read_dir(directory)
        .map_err(|error| format!("read {directory}: {error}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("read {directory}: {error}"))?;
    // Keyed by benchmark id rather than by directory name: the aggregator
    // pairs ports by id, and the TypeScript runner sorts by id too.
    let mut manifests = BTreeMap::new();
    for entry in entries {
        if !entry.path().is_dir() {
            continue;
        }
        let path = entry.path().join("benchmark.json");
        let manifest: BenchmarkManifest = read_json(&path.to_string_lossy())?;
        manifests.insert(manifest.id.clone(), manifest);
    }
    Ok(manifests.into_values().collect())
}

fn read_json<T: serde::de::DeserializeOwned>(path: &str) -> Result<T, String> {
    let content =
        fs::read_to_string(Path::new(path)).map_err(|error| format!("read {path}: {error}"))?;
    serde_json::from_str(&content).map_err(|error| format!("decode {path}: {error}"))
}

pub fn input_identity(input: &str) -> InputIdentity {
    InputIdentity {
        bytes: input.len(),
        code_units: input.encode_utf16().count(),
        sha256: sha256(input),
    }
}

pub fn sha256(value: &str) -> String {
    let digest = Sha256::digest(value.as_bytes());
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

/// Convert a parse result to JSON the way `encoding/json` and
/// `JSON.stringify` do. Both write a whole-valued number without a
/// fractional part, and the aggregator compares ports by their serialized
/// text, so `6.0` here would read as a Rust-only divergence.
pub fn canonical_json(value: &Value) -> Json {
    normalize(&value.to_json())
}

fn normalize(value: &Json) -> Json {
    match value {
        Json::Number(number) => match number.as_f64() {
            Some(number) if number.fract() == 0.0 && number.abs() < 9.007_199_254_740_992e15 => {
                Json::Number((number as i64).into())
            }
            _ => value.clone(),
        },
        Json::Array(items) => Json::Array(items.iter().map(normalize).collect()),
        Json::Object(entries) => Json::Object(
            entries
                .iter()
                .map(|(key, entry)| (key.clone(), normalize(entry)))
                .collect(),
        ),
        _ => value.clone(),
    }
}

fn clean_error(message: &str) -> String {
    let mut plain = String::with_capacity(message.len());
    let mut characters = message.chars().peekable();
    // Diagnostics may be coloured. The raw result is compared and stored as
    // text, so the escape sequences come out here rather than in a reader's
    // terminal.
    while let Some(character) = characters.next() {
        if character == '\u{1b}' && characters.peek() == Some(&'[') {
            for tail in characters.by_ref() {
                if tail.is_ascii_alphabetic() {
                    break;
                }
            }
            continue;
        }
        plain.push(character);
    }
    plain
        .lines()
        .next()
        .unwrap_or("parse error")
        .chars()
        .take(500)
        .collect()
}
