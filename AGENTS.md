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
| `scripts/run-all.mjs` | Builds/runs both ports and owns run-directory creation. |
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
   change and must produce a new run.
9. Rebuild history by scanning immutable run directories. Never maintain a
   second hand-authored list of results.
10. Trend lines must identify environment discontinuities. Do not imply that
    measurements from different machine fingerprints form one controlled
    time series.
11. Every run carries the exact config, manifests, schemas, and generated input
    sources used to produce it. Historical validation uses those snapshots,
    never today's definitions.

## Commands

```sh
npm ci
go mod download
make build
make test
make measure
make site
```

Use `make test` before every commit. Use `make measure` when grammar behavior,
runner code, dependency versions, profiles, or host/runtime state changes in a
way that should be recorded.

## Adding work

Follow `docs/adding-a-benchmark.md`. New ports implement the same JSON stdin/
stdout-independent runner contract: arguments name the config/profile and the
runner prints exactly one raw result document to stdout. Diagnostics belong on
stderr.
