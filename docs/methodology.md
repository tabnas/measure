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
4. optionally requests one garbage collection before measurement, where the
   runtime has one to request;
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
- Parser construction is excluded by constructing one parser per benchmark and
  reusing it, which is as far as a port's public API allows. Where an engine
  rebuilds internal state inside its own parse call, that cost is inside the
  measurement and cannot be hoisted out of it. The Rust engine does this: at
  parser revision `25de0904`, an empty-source parse, which returns before
  reading a byte, costs about 15 microseconds on the recorded host, and every
  parse pays it. Read the small-input rows with that in mind. They are not
  wrong, but for that port they report a fixed cost per call as much as they
  report throughput.

## Parser pins

Each port pins its parser exactly, and how it pins differs by runtime because
the published artifacts differ:

- TypeScript pins `@tabnas/parser` by version in `package.json` and
  `package-lock.json`.
- Go pins `github.com/tabnas/parser/go` by version in `go.mod` and `go.sum`,
  resolved from the repository's `go/vX.Y.Z` tags.
- Rust pins the `tabnas` crate by **git revision** in
  `ports/rust/Cargo.toml` and `ports/rust/Cargo.lock`. The crate is not
  published to crates.io and the parser repository carries no `rs/` tags, so a
  revision is the only exact pin available. The revision is what the run is
  reproducible against; the version the runner reports is the crate's in-tree
  version, which can be ahead of the last TypeScript and Go release.

A row that compares ports is therefore a comparison of the recorded parser
versions, and the revision in the lockfile is what settles any question the
version string leaves open.

## Reproducibility

Every run records:

- repository commit or dirty marker;
- benchmark suite and parser versions;
- short pseudonymous measurement-host fingerprint;
- runtime, OS distribution and kernel, architecture, CPU, logical CPU count,
  and memory;
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
port, parser version, runtime version, repository commit, host fingerprint, and
environment fingerprint. A comparable series holds the suite version, host
fingerprint, port, runtime version, and environment fingerprint constant while
allowing parser version and commit to change. Host, hardware, runtime, or suite
changes therefore start a visibly separate series rather than silently joining
unlike measurements.

The fingerprint covers the OS identifier, distribution name, kernel release,
architecture, processor model, logical CPU count, and total memory.

The host fingerprint is the first 12 hexadecimal characters of SHA-256 over a
domain-separated host key. By default the key comes from the operating system
machine identifier: `/etc/machine-id` or `/var/lib/dbus/machine-id` on Linux,
and the `IOPlatformUUID` reported by `ioreg` on macOS.
`TABNAS_MEASURE_HOST_KEY` can provide a stable private key for an ephemeral
host or logical runner pool, and is required on any platform where neither
source exists. The source key is never retained,
and the harness does not collect the machine name. Two hosts with identical
hardware remain separate because the host fingerprint is an independent series
dimension. A hardware or OS change on one host remains separate because the
environment fingerprint is another independent dimension.

`results/latest/` is convenience output only. The source of historical truth is
the set of immutable directories under `results/runs/`.
