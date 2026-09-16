# Adding a benchmark or port

## Benchmark

1. Create `benchmarks/<id>/benchmark.json` conforming to
   `schemas/benchmark.schema.json`.
2. Include positive and negative capability cases. Accepted cases should state
   an exact JSON-compatible result.
3. Define deterministic performance cases using a named generator and explicit
   size parameters.
4. Implement the generator in every port runner and in
   `scripts/lib/common.mjs`, then implement each port's parser factory.
5. Run `make test`; the aggregator will reject missing cases or input-hash
   disagreement.
6. Document what the case proves in `benchmarks/<id>/README.md`.
7. Run `make measure` when the new rows are ready to publish.

Benchmark identifiers and case identifiers are stable public keys. Never reuse
one for a different input or semantic contract.

## Port

A port runner must:

- accept the config, benchmark, profile, run-metadata, and
  `--host-fingerprint` arguments supplied by `scripts/run-all.mjs`;
- read every canonical manifest under the supplied benchmark snapshot;
- write exactly one `port-result.schema.json` document to stdout;
- send diagnostics only to stderr;
- fail non-zero on malformed manifests, parser construction errors, or internal
  runner errors;
- report capability failures in JSON so the cross-port aggregator can explain
  them;
- preserve raw performance samples;
- to take part in the counted mode, accept `--deterministic=<benchmark>/<case>`
  with `--iterations=<n>`, parse that case once and then exactly `n` times
  with no clock, and print the input identity, the checksum of the first
  parse, the checksum of the `n` parses, and the runtime settings it read
  back (an empty object where there are none), so that a tool wrapped
  around the process sees the same work every time and the harness can
  check what the process did against what it asked for. A port that
  cannot do this meaningfully, such as one whose runtime compiles at run
  time, omits the `deterministic` entry from its config and is left out.

Add its command to `measure.config.json` and ensure CI installs the required
runtime. The port must use the same parser version family as the other rows or
the matrix must identify the version difference explicitly.

## Release history

Update a port's exact dependency pin and lockfile in one commit, then record a
new full run from that clean commit. Use `make measure` locally or dispatch the
`Record historical measurement` workflow. Each run preserves its own parser,
runtime, suite, commit, host, and environment identities, so adding a port or
version extends the catalog without mutating prior evidence.
