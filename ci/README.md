# ci/

Staging area for GitHub Actions workflow changes.

This directory exists because session credentials cannot write
`.github/workflows/*` — see admin `DECISIONS.md` ADR-8. To change CI:

1. Put the intended workflow file in `workflows/`.
2. A maintainer promotes it with the admin `rollout/apply-ci-folders.sh`
   script.

## Pending

- **`workflows/ci.yml`** and **`workflows/record.yml`** — the same two
  workflows already in `.github/workflows/`, plus what the Rust port
  needs: a step that prints `cargo --version` and `rustc --version`, and
  a `cargo fetch --locked` alongside the npm and Go fetches.

  No setup action is added. The `ubuntu-24.04` image ships a stable Rust
  toolchain, so pinning one would mean a third-party action with a SHA to
  keep current; the version print covers the case where a future image
  drops the toolchain. There is no cargo cache either, for the same
  reason — `actions/cache` is first-party but would need a pinned SHA,
  and a cold build of the parser is about 40 seconds. A maintainer who
  wants either can add them when promoting.

  Promote these together with the Rust port, not before: without the
  `cargo fetch` the record workflow still works (`npm run build` fetches),
  but a network failure would surface in the middle of a measurement
  rather than in setup.

- **`workflows/docs.yml`** — the prose gate: Vale over the reader-facing
  pages at the levels set in `.vale.ini`, on the file list
  `scripts/gated-docs.mjs` produces. See `docs/STYLE-GUIDE.md`.

  It needs no benchmark run and no secrets, and pins its own Vale
  version. Errors fail the job; warnings go to the run summary as a
  report. `make prose` runs the identical check locally, and `npm test`
  already runs the other half of the gate (`scripts/docs.test.mjs`), so
  promoting this adds the spelling and Google-convention arm rather than
  the whole gate.
