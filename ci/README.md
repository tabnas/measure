# ci/

Staging area for GitHub Actions workflow changes.

This directory exists because session credentials cannot write
`.github/workflows/*` — see admin `DECISIONS.md` ADR-8. To change CI:

1. Put the intended workflow file in `workflows/`.
2. A maintainer promotes it with the admin `rollout/apply-ci-folders.sh`
   script.

## Promoted, 2026-09-22

Everything that was staged here is now live, moved by the rollout script
rather than edited: `workflows/ci.yml` and `workflows/record.yml`, with
the Rust toolchain print and the `cargo fetch --locked`, and
`workflows/docs.yml`, the prose gate. Each is the file of the same name
in `.github/workflows/`. Nothing is pending. Read the workflows
themselves rather than a description of them here.
