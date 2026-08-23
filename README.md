# tabnas measure

Reproducible capability and performance measurements for the implemented
Tabnas ports.

The repository keeps four concerns separate:

1. [`benchmarks/`](benchmarks/) defines language cases, capability fixtures,
   and deterministic performance inputs once.
2. [`ports/`](ports/) implements the same benchmark contract against each
   runtime port.
3. [`results/`](results/) stores immutable raw runs and generated comparison
   matrices.
4. [`site/`](site/) renders the committed result catalog at
   <https://tabnas.github.io/measure/>.

The Pages site uses the canonical Tabnas logo and emblem copied verbatim from
`tabnas/web/src/assets/brand/`.

The initial catalog measures:

- **Adder:** the canonical Tabnas `1+2+3` grammar and numeric result.
- **Even palindromes:** the classic non-deterministic context-free language
  `L = { wwᴿ | w ∈ {a,b}* }`. A state-aware midpoint condition lets the
  deterministic rule machine recognize it without automatic branch search.

Both are run against TypeScript/Node.js and Go using Tabnas `0.9.0`.

## Quick start

Requirements: Node.js 24+, npm, and Go 1.26+.

```sh
npm ci
go mod download
make test
make measure
```

`make test` builds both runners and executes a short validation profile.
`make measure` records a full run under `results/runs/`, refreshes
`results/latest/`, updates the catalog, and rebuilds the Pages history data.

For repeated measurements across a fleet, assign each physical machine or
runner pool a stable ID and an optional readable label:

```sh
make measure HOST_ID=lab-m3-01 HOST_LABEL='Intel m3 lab laptop'
```

The defaults are the observed hostname for both fields. The equivalent
environment variables are `TABNAS_MEASURE_HOST_ID` and
`TABNAS_MEASURE_HOST_LABEL`. Keep `HOST_ID` stable: history uses it to group
repeated observations, while the separate environment fingerprint starts a
new comparable series after hardware, kernel, or OS changes.

To record a parser release, pin its version in `measure.config.json`, update
the lockfiles, and run `make measure` from a clean commit. The
`Record historical measurement` GitHub workflow provides the same operation on
the standard hosted runner and can also be triggered with the
`parser-release` repository-dispatch event. It commits a new run; it never
rewrites an earlier one.

See [`docs/methodology.md`](docs/methodology.md) before interpreting numbers
and [`docs/adding-a-benchmark.md`](docs/adding-a-benchmark.md) before adding a
case or port.

## Result policy

- Raw per-port JSON is retained; matrices are derived from it.
- Every run snapshots its config, schemas, manifests, and exact generated
  inputs, so later suite changes cannot reinterpret old measurements.
- Historical runs are immutable and cataloged by host ID, suite version,
  per-port parser version, port set, repository commit, and environment
  fingerprint.
- Every performance row records the exact input hash, runtime versions,
  machine metadata, warmup policy, iterations, and raw sample durations.
- Cross-port rows are emitted only when the input hashes match and all
  capability fixtures pass.
- A result is descriptive of its recorded machine, not a universal ranking.
- Trend views can filter by host and visibly separate host, runtime, suite, and
  environment series; `latest` never replaces historical data.

MIT licensed.
