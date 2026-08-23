# Measurement methodology

## Scope

The suite measures two things separately:

- **Capability:** fixed accepted/rejected inputs and expected semantic values.
- **Performance:** steady-state, sequential, parse-only throughput for one
  already-constructed parser and one deterministic input per matrix cell.

Parser construction, dependency loading, process startup, compilation, JSON
serialization, aggregation, and site generation are excluded from timings.

## Execution

Each port reads the same benchmark manifests and implements the same input
generators. Before a matrix is produced, the aggregator requires matching
benchmark/case identifiers, byte counts, and SHA-256 input hashes.

For each performance cell, a runner:

1. constructs one parser;
2. parses repeatedly for the profile's warmup duration;
3. calibrates a batch by doubling its iteration count until it reaches the
   target sample duration or the configured cap;
4. optionally requests one garbage collection before measurement;
5. records the elapsed nanoseconds for every independent batch sample;
6. consumes each parse result in a checksum.

The matrix derives nanoseconds per operation for each sample and reports the
minimum, median (p50), p95, arithmetic mean, sample standard deviation,
coefficient of variation, operations per second, and source MiB/s. Raw batch
durations and iteration counts remain in the per-port result documents.

## Interpretation

- Compare rows only inside one run. Different machines, power modes, thermal
  states, runtime versions, and background load are not normalized.
- The median is the headline statistic. Minimum is useful diagnostic evidence,
  not the advertised result.
- Ratios show relative throughput on the recorded host, not language quality.
- Small-input rows include fixed API and allocation costs. Large-input rows
  better expose scaling, but can also amplify garbage collection.
- The harness is not a substitute for application traces, hostile-input tests,
  latency under concurrency, memory profiles, or cold-start measurements.

## Reproducibility

Every run records:

- repository commit or dirty marker;
- benchmark suite and parser versions;
- runtime, OS, architecture, CPU, logical CPU count, and memory;
- profile parameters;
- input sizes and SHA-256 hashes;
- exact config, schema, benchmark-manifest, and generated-input snapshots;
- raw sample durations and iterations;
- a result checksum.

Committed runs are immutable. A rerun creates a new run identifier.
Historical validation reads each run's snapshots, so changing today's parser
pins, port set, profiles, manifests, or generators does not reinterpret old
evidence.

## Historical series

The catalog retains every complete run so parser releases and newly implemented
ports remain visible over time. Each point records its benchmark case, suite,
port, parser version, runtime version, repository commit, and environment
fingerprint. A comparable series holds the suite version, port, runtime version,
and environment fingerprint constant while allowing parser version and commit
to change. Hardware, runtime, or suite changes therefore start a visibly
separate series rather than silently joining unlike measurements.

`results/latest/` is convenience output only. The source of historical truth is
the set of immutable directories under `results/runs/`.
