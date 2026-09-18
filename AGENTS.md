# Agents guide — measure

## Purpose

`measure` is the Tabnas fleet's evidence repository. It records reproducible
capability and performance observations across runtime ports. It does not
change parser semantics and it does not treat one workstation run as a
universal ranking.

## Repository map

| Path | Contract |
| --- | --- |
| `benchmarks/<id>/benchmark.json` | Canonical capability cases and deterministic performance generators. Both ports read these files directly. |
| `schemas/` | JSON Schema contracts for benchmark manifests, raw port results, and matrix reports. |
| `ports/typescript/` | TypeScript/Node runner using `@tabnas/parser`. |
| `ports/go/` | Go runner using `github.com/tabnas/parser/go`. |
| `ports/rust/` | Rust runner using the `tabnas` crate, pinned by git revision. |
| `scripts/run-all.mjs` | Builds/runs every port and owns run-directory creation. With `--deterministic`, also counts a fixed case set under callgrind. |
| `scripts/lib/deterministic.mjs` | The counted mode: valgrind detection, the callgrind totals parser, the two-run measurement, the environment the counted process is given, the checks on what the runners report, on the profiles and on the ports against each other, and the read-back the aggregator uses. |
| `scripts/aggregate.mjs` | Validates cross-port identity and derives statistics/matrices. |
| `scripts/build-site.mjs` | Builds the Pages data catalog from committed matrices. |
| `results/runs/<run-id>/` | Immutable definition/input snapshots, raw results, matrix, and Markdown report. |
| `results/latest/` | Generated copy of the newest complete run. |
| `site/` | Static GitHub Pages application and generated catalog JSON. |

## Invariants

1. A benchmark's input is defined once in its manifest. Port-specific copies
   are forbidden.
2. Both ports must report the same SHA-256 input hash for a matrix row.
3. Capability failures fail the run; performance numbers from a failing
   implementation are never published as comparable.
4. Parser construction, process startup, compilation, and report generation
   are outside parse-only timings. Say so in every report.
5. Keep raw sample durations. Do not commit only a summary statistic.
6. Results are immutable. Generate a new run rather than editing an old one.
7. Generated `results/latest/`, `results/index.json`, and
   `site/data/catalog.json` must agree with the immutable run catalog.
8. Pin runtime dependencies exactly. A parser upgrade is its own measured
   change and must produce a new run. The Rust crate is unpublished and
   untagged, so its pin is a git revision in `ports/rust/Cargo.toml` and
   `ports/rust/Cargo.lock`; the version the runner reports is the crate's
   in-tree version and can be ahead of the last TypeScript and Go release.
9. Rebuild history by scanning immutable run directories. Never maintain a
   second hand-authored list of results.
10. Trend lines must identify host and environment discontinuities. Do not
    imply that measurements from different host fingerprints or environment
    fingerprints form one controlled time series.
11. Every run carries the exact config, manifests, schemas, and generated input
    sources used to produce it. Historical validation uses those snapshots,
    never today's definitions.

## Commands

```sh
npm ci
go mod download
cargo fetch --locked --manifest-path ports/rust/Cargo.toml
make build
make test
make measure
make measure-deterministic
make site
```

Use `make test` before every commit. Use `make measure` when grammar behavior,
runner code, dependency versions, profiles, or host/runtime state changes in a
way that should be recorded. Use `make measure-deterministic` (needs
`valgrind`) when the change being recorded is expected to be worth less
than the wall-clock floor in `docs/methodology.md`; a run recorded that way
is an ordinary run that also carries the counts.

## Adding work

Follow `docs/adding-a-benchmark.md`. New ports implement the same JSON stdin/
stdout-independent runner contract: arguments name the config/profile and the
runner prints exactly one raw result document to stdout. Diagnostics belong on
stderr.

## Agent tooling

An agent working in this repository does not have to drive it by hand. The
org ships two things that already understand these grammars:

- **[`@tabnas/mcp`](https://github.com/tabnas/mcp)** — an MCP server (stdio)
  and the unified `tabnas` CLI: parse, validate and inspect any tabnas
  format, this one included.
- **[`tabnas/skills`](https://github.com/tabnas/skills)** — Agent Skills for
  working on tabnas grammars and plugins.

Prefer them over ad-hoc scripts when exploring a grammar or checking a parse
result.
