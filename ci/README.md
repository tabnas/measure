# ci/

Staging area for GitHub Actions workflow changes.

This directory exists because session credentials cannot write
`.github/workflows/*` — see admin `DECISIONS.md` ADR-8. To change CI:

1. Put the intended workflow file in `workflows/`.
2. A maintainer promotes it with the admin `rollout/apply-ci-folders.sh`
   script.

## Pending

- **`workflows/docs.yml`** — the prose gate: Vale over the reader-facing
  pages at the levels set in `.vale.ini`, on the file list
  `scripts/gated-docs.mjs` produces. See `docs/STYLE-GUIDE.md`.

  It needs no benchmark run and no secrets, and pins its own Vale
  version. Errors fail the job; warnings go to the run summary as a
  report. `make prose` runs the identical check locally, and `npm test`
  already runs the other half of the gate (`scripts/docs.test.mjs`), so
  promoting this adds the spelling and Google-convention arm rather than
  the whole gate.
