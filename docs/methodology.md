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

## Deterministic metrics

Wall clock has a floor, and the harness cannot lower it by sampling more.
A null change to the Rust engine (one function marked never-inline, which
displaces the code after it and changes nothing) moves the suite by
about three percent either way from one build to the next; the band, and
what it was measured on, are in the note at the end of this section.
Interleaving two builds within one session controls for drift over time.
It does not control for where the linker put the code, and that is what
moves.

So the rule is this. **A wall-clock claim below 3% is not a claim.** A
change worth less than the band above is reported in one of two ways:
as "removed N instructions with no visible regression", with the
instruction count from the mode described here; or by layout-randomised
repetition, several builds per arm with varied padding, reporting the
distribution rather than one pair of medians. An instruction count is a
screen and not a verdict, and it fails in both directions. Removing
allocation converts to wall clock at or above its instruction saving;
removing computation converts at a fraction of it; and trading either for
an atomic operation or a pointer hop on a hot path loses on the clock
while saving instructions. A change that saves instructions has earned a
wall-clock measurement, and nothing more.

### Running it

The mode counts instead of timing:

```sh
npm run measure:deterministic
```

That is `npm run measure` with `--deterministic` added, and it records a
normal full-profile run whose directory also carries the counts. For a
run that is not committed, pass the flag to the script directly:

```sh
node scripts/run-all.mjs --profile smoke --output .build/counted --deterministic
```

The mode needs `valgrind` on the path. A host without it is told so
before anything is built, in two lines, one naming what is missing and
one saying to install it or to run without the flag, and the harness
stops with no stack trace; a normal `npm run measure` never asks for
it. Expect the counted section to take several minutes: callgrind runs
a process around fifty times slower than native, which is why the case
set is small and fixed rather than the whole matrix.

The case set is in `measure.config.json`, under `deterministic.cases`,
with the iteration count next to it. The ports that take part are those
with a `deterministic` entry: Rust, and Go with `GOMAXPROCS=1` and
`GOGC=off`. The first is a constraint, because valgrind cannot follow
the Go scheduler switching goroutine stacks across threads. The second
is what makes the count a count: the Go runtime paces its collector on
wall-clock terms that valgrind stretches fifty-fold, so with the
collector on, repeated counts of the same twenty parses differ by a
quarter, and with it off they agree to a tenth of a percent (the figures
and the command are in the note at the end of this section). So the Go
figure is the work the parser does and none of what the collector does,
and the collector's cost is in the wall clock column, where it was
already. TypeScript has no entry and that is
deliberate. V8 compiles at run time, so an instruction count of the Node
port counts the compiler as much as the parser and says nothing that the
wall clock does not.

The collector setting reaches the cache columns too, and it moves them
the other way. With the collector off nothing is freed, so every parse
allocates into memory the process has never touched, and the first
write to each of those lines misses at every level of the simulated
cache. On `adder/terms-512` the Go port records 5,388 first-level write
misses per parse, of which 5,292 go on to miss the last level, where
the Rust port, recycling memory through its allocator, records 19,285
and 57. Go's D1 write-miss and LL data-miss columns are a cost of the
setting more than of the port. The report prints them beside Rust's
because they are what the counted process did, and a reader compares
instructions across ports and compares misses across revisions of one
port, under one setting.

The counted process is given an environment the harness builds, not the
shell's. The Go runtime paces its collector on `GOMEMLIMIT` as well as
`GOGC` and reads `GODEBUG`; the Rust port's allocator reads its
`MIMALLOC_` settings when the process starts; the loader honours
`LD_PRELOAD`; valgrind reads `VALGRIND_OPTS`. Each changes the count, a
runner can read back only the first two of the Go runtime's, and a
setting left in the recording shell would otherwise reach the process
and appear nowhere. So the harness passes `PATH` and `TMPDIR` from the
host, whichever are set, and the port's configured settings, and
nothing else, and the document records what was passed: the host
variables by name and the settings by value. A run whose document names
anything else is refused at read-back.

For each case, the harness runs the port's runner twice under
`valgrind --tool=callgrind --cache-sim=yes --branch-sim=yes`: once in
its `--deterministic` mode at the configured number of parses, and once
at zero. The runner in that mode has no warmup, no calibration, and no
clock; it builds the parser, generates the input, parses once, parses
the configured number of times, and prints the input's hash, the
checksum of the first parse and the checksum of the loop. The zero-parse
run is the baseline, and the difference divided by the count is the cost
of one parse. Reading the config, building the parser, generating the
input and the first parse are in both runs and cancel, so the per-parse
figure carries no share of process startup and depends on no symbol name
the tool has to find.

The first parse is in both runs because an engine can leave work until
it is first asked to parse. At the pinned revision the Rust engine
builds its parser on the first call, and under callgrind its first parse
of `adder/terms-512` costs about a hundred thousand instructions more
than its second (the note at the end of the section has the figures and
the command). Without a parse in the baseline that one-time work sits
inside the per-parse figure at one part in twenty, about 0.06%. That is
under the mode's own repeatability, and it is still startup work in a
figure described as carrying none, so the runner takes the parse and the
baseline carries the work.

The runner's document is checked rather than trusted, the way the
wall-clock aggregator checks each port's input hash and capability
results. The loop's checksum has to be the configured count times the
checksum of the first parse, reduced by the modulus every runner uses,
so a loop that ran nineteen times is refused; a case whose parse
checksums to zero is refused too, because a loop of zeros proves nothing
about how many times it ran. The ports counted in one run have to report
the same input hash, the same first-parse checksum and the same loop
checksum, since they parse the same input the same number of times, and
a port that parses to a different value is refused rather than published
as comparable. And a runner reports the settings it read back from its
runtime rather than the ones it was given: the Go runner prints
`GOMAXPROCS` as the scheduler has it and `GOGC` as the collector has it,
so a count taken with the collector on is refused before it can be
recorded under a config that says `GOGC=off`. The read-back the
aggregator uses repeats every one of these checks on the recorded
documents, and adds one the recorder has no need of: every total a
document records is read back out of the profile it names, so a figure
in the JSON that the profile on disk does not carry is refused, the way
`matrix.json` is held to the raw wall-clock samples, and each profile
is held to being a profile of what the document says was counted: its
`cmd:` line has to be the recorded runner command, a run snapshot, the
case and the count, and its `creator:` line has to be the tool version
the document names, so a profile copied in from another case, another
count or another valgrind is refused with its totals intact. The tool
and the cache geometry the report quotes are the ones every port and
every case in the run was held to.

### Reading it

A counted run carries, next to the wall-clock evidence:

- `raw/deterministic/<port>.json`. The totals line of every profile, for
  the measured run and the baseline, keyed by callgrind event name, with
  the tool version and arguments, the runner command, the environment
  the process was given and the settings the runner reported running
  under, the input's hash, the checksum of one parse and of each loop,
  and the simulated cache geometry.
- `raw/deterministic/<port>/<benchmark>-<case>.out` and the matching
  `-baseline.out`. The callgrind profiles themselves, with the recording
  host's repository and home directories replaced by placeholders. Run
  `callgrind_annotate` on one to see where the instructions went.
- `matrix.json`, under `deterministic.rows`. Per parse, for each port:
  `instructions` (Ir), `d1ReadMisses`, `d1WriteMisses`, `llDataMisses`,
  `branches` and `mispredicts`, alongside the raw totals they were
  derived from and `relativeInstructions` normalised to the port with
  the fewest.
- The run's `README.md`, under "Deterministic metrics". The same figures
  as a table.

Instruction count is the headline and the cache counters are secondary,
and the difference is repeatability, not importance. Two callgrind runs
of one binary agree in instructions to a fraction of a tenth of a
percent and differ in first-level data-cache read misses by a tenth or
more (the note at the end of the section has the pair): the engine's
hash tables are seeded per process, where the allocator places memory
varies with them, and misses follow both. That band is one binary
counted twice, not two recorded runs. Where the repository holds two
counted runs at one pin, the difference between their
`deterministic.rows` is the mode's own run-to-run repeatability, and a
change smaller than it is not a claim either. A change that moves
instructions by 1% is well clear of the band; a change that moves D1
misses by 5% has to be shown twice; and Go's write-miss and last-level
columns carry the collector setting as well as the port, so a movement
in them is read against Go's own earlier runs rather than against Rust.

Two counted runs are comparable only under the same valgrind version
and the same simulated cache geometry. Neither is pinned: the tool is
the one runtime dependency this repository takes from the host rather
than from a lockfile, and callgrind takes the geometry it simulates
from the machine it runs on, warning when the machine's last-level
cache is not one it can model exactly. A run records both, holds every
port and every case in it to them, and prints them at the top of its
counted section; a counted run recorded on a host whose tool or
geometry differs from the previous counted run there is announced at
the terminal the way a changed runtime version is, and the counts on
either side of that line are not one series, however unchanged the
ports are. Check the two before reading anything into a difference
between two runs' `deterministic.rows`. And a counted run is otherwise
an ordinary run: every run recorded before the mode existed lacks the
section and stays as it was, and a run made without the flag lacks it
too.

### Measured once, outside the harness

The figures this section leans on for its band and its choices were
measured once each, by hand, on September 16, 2026, on the host that
recorded the runs of the day before (fingerprint `063cd3b35d2f`), under
valgrind 3.22.0 and at the engine revisions each port pinned that day.
None of them is a recorded run and none can be re-derived from this
repository, so they are the reason the rule reads as it does and not
the page's own evidence for it. Each is listed with what it was
measured on, and where this harness's own runners can repeat the
measurement, with the command.

- **The wall-clock floor, -2.49% to +2.92% with a mean of +0.64%.** The
  full profile's median per row, one build of the Rust engine against
  the same engine with one function marked never-inline, interleaved
  across rounds within one session. It rests on two engine builds this
  repository never made and cannot make, and it stands as the reason
  for the 3% rule, not as a figure to compare against.
- **The Go collector, on and off: 56.5M, 58.3M and 72.1M instructions
  for three counts of twenty parses with it on; 49.24M and 49.32M for
  two with it off.** Measured on the harness's own Go runner at
  `adder/terms-512`, before the parse before the loop was added, so a
  repeat records one parse more in both settings. To repeat it, build
  the runners and count the process by hand, once with the collector
  as the runtime defaults it and once off:

  ```sh
  npm run build
  for setting in 100 off; do
    GOMAXPROCS=1 GOGC=$setting valgrind -q --tool=callgrind --cache-sim=yes --branch-sim=yes \
      --callgrind-out-file=.build/go-gogc-$setting.out \
      .build/measure-go --config=measure.config.json --benchmarks=benchmarks \
      --deterministic=adder/terms-512 --iterations=20 >/dev/null
    grep ^totals: .build/go-gogc-$setting.out
  done
  ```

  The first number on each `totals:` line is the instruction count.
  Run the loop twice and the two `off` lines agree where the two `100`
  lines do not.
- **The Rust engine's first, second and third parse of
  `adder/terms-512`: 7,878,111, 7,778,955 and 7,789,621 instructions.**
  Measured on the harness's own Rust runner, as the differences between
  the process counted at zero, one, two and three parses. To repeat it,
  count the runner at `--iterations=0`, `1`, `2` and `3` with the
  command above, with `.build/measure-rust` in place of the Go runner
  and no `GO` settings, and subtract each `totals:` instruction count
  from the next. The runner now takes one parse before the loop, so the
  count at zero already carries the first parse and the differences
  start at the second.
- **Two callgrind runs of one binary: 0.16% apart in instructions, 12%
  apart in D1 read misses.** Measured on a profiling build of the Rust
  engine in the shipped configuration (`lto = "fat"`,
  `codegen-units = 1`, `opt-level = 3`, `mimalloc`, with debug
  information kept for the annotator) parsing a 512-term adder input
  twenty times. That binary is not the runner this harness builds,
  which carries no debug information, and the pair is not in the
  repository. The mode's own repeatability is the figure to use once
  two counted runs at one pin are recorded, and this pair only says
  which counter to expect to move.

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
