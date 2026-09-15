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
- **Two runs recorded back to back do not resolve a difference of a few
  percent.** A run at a fixed pin, repeated three minutes later on the same
  host, moved Rust's rows by a median of 2.6% and by 17.2% at one case; the
  clearer statement is the control, Go, whose parser had not changed at all
  between the two and which still moved by a median of 4.0% and up to 14.7%.
  Runs `…T160653387Z-…-302a4d83` and `…T160917518Z-…-dd84cf8c` are that pair,
  recorded for exactly this purpose. So a change expected to be worth a few
  percent should be measured by interleaving the two builds within one
  session and comparing medians across rounds, with the harness asked only to
  confirm the direction afterwards. Changing the pin between run A and run B
  is not enough. The cumulative figures this repository exists to publish are
  a different matter: a row that moves by 2× or 4× is an order of magnitude
  clear of this.
- **A runtime version can change underneath a fingerprint that does not
  move.** The environment fingerprint answers "same machine", and it has to:
  the aggregator requires every port of a run to report the same one, and the
  three ports run three different runtimes, so no runtime version can ever be
  part of it. Between runs `…T191334778Z-…-cdfcad42` and
  `…T192906755Z-…-2f9490e5`, recorded sixteen minutes apart, this harness's
  container replaced Node 24.21.0 with Node 22.22.2. Both runs carry
  environment fingerprint `2e786edc…`, correctly, because it is the same
  machine. Go, the control, moved by its usual few percent. TypeScript moved
  by **+106% on `adder/terms-16384`** and +57% on `palindrome/chars-32768`,
  the two largest rows. Read down the column, those rows say the parser
  regressed; they say nothing about the parser. The site's history charts
  already break the series on runtime version, and `npm run measure` now
  prints the change when it records a run whose toolchain differs from the
  previous one on the same host. Neither reaches a reader comparing two
  matrices by eye, so check `runtimeVersion` on both before reading anything
  into a difference between them.
- **Each port is built the way it would be shipped, which is not the same
  configuration for each, because the runtimes do not supply the same things.**
  Two of these arrived late, both worth more than most of the engine changes
  they sit alongside, and runs before and after them are not directly
  comparable for the Rust column.
  - *Cross-module inlining.* Go's compiler inlines across packages within a
    binary by default and V8 inlines across module boundaries at runtime. Rust
    needs `lto = "fat"` or the engine stays a separate crate the runner cannot
    inline into. Worth 1.10x-1.15x on every case; runs from `…T183610…` onward.
  - *The allocator.* Go ships the runtime's and TypeScript ships V8's; Rust
    takes whatever libc supplies, which on this host is glibc. The engine
    allocates heavily enough that this is worth 1.09x-1.56x, so the port was
    being measured against glibc as much as against itself. The Rust runner now
    sets `mimalloc` as its global allocator, pinned exactly like every other
    dependency; runs from `…T184…` onward.
  - The general point is worth more than either flag: **a port can be slower
    because of what its runtime does not bring, rather than because of its own
    code, and that is a property of the measurement rather than of the port.**
    Check what each runtime supplies before reading a gap as the engine's.
- **Profile the build that ships, not a convenient one.** The Rust port's
  profiling builds were made without LTO and against glibc, while the binary
  this harness measures uses `lto = "fat"` and `mimalloc`. Those are two
  different programs. On a 512-term adder the shipped one runs 17% fewer
  instructions, and the share of a parse spent inside the allocator drops
  from roughly 20% to roughly 3%. A change ranked against the first profile
  is ranked against a cost the second does not carry: allocation looks like
  the thing to attack, and under the shipped allocator it is already close
  to free. Rebuild the profiling binary with the shipped profile and the
  shipped allocator before reading a profile as a list of what to fix. This
  is the same trap as the two build-configuration bullets above, one step
  further back.
- Parser construction is excluded by constructing one parser per benchmark and
  reusing it, which is as far as a port's public API allows. Where an engine
  rebuilds internal state inside its own parse call, that cost is inside the
  measurement and cannot be hoisted out of it.
  **The Rust engine used to do this** and no longer does: `Tabnas::parse`
  rebuilt its whole parse view on every call, cloning a thirty-field `Options`
  three times over and reassembling the rule and action tables, and it now
  prepares both once and reuses them until the configuration changes. That is
  what the `d9e339a`..`404ab87` runs record, and it is worth 2.0x on
  `adder/terms-8` and 1.98x on `palindrome/chars-16` with the large rows
  unmoved, which is the signature of a cost paid per call rather than per
  token.
  This paragraph existed as a caveat, so that those rows would not be read as
  pure throughput. It turned out to also be a defect report, and the two rows
  it warned about were the two furthest from Go. **Read a caveat about a port's own overhead as a bug to
  file, not only as a footnote to the numbers.**

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

**Every run carries those files, under `definitions/manifests/<port>/`.** A
run names its parsers by the version each port reports, and the Rust crate is
unpublished, so every revision on a branch reports the same in-tree version:
the twenty distinct revisions behind this repository's Rust series, measured
across forty runs, all call themselves 0.9.7. Without the manifests the only
link from a run to the revision it measured is the run's `repositoryCommit`,
and a branch that is rebased or squashed takes that commit away while the run
stays. One run here was reported as already naming an object no longer in the
history it was reviewed against. The snapshot makes a run answer the question
by itself.

Runs recorded before the snapshot was added do not carry it. For those, the
revision is still recoverable while the commit survives, by reading the
manifest out of it:

```sh
git show "$(jq -r .run.repositoryCommit results/runs/<run>/matrix.json)":ports/rust/Cargo.toml
```

That is a weaker guarantee than a run carrying its own answer, and it is the
reason the snapshot exists. Counting the twenty revisions above needs exactly
this command, run once per recorded run.

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
