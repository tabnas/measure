# ci/

No scripts live here. The workflows in `.github/workflows/` run the
`npm` scripts and the files under `scripts/` directly.

To change CI, edit `.github/workflows/` in a reviewed pull request.
Session credentials push workflow files (admin `DECISIONS.md` ADR-8, as
amended 2026-09-24), so staging a workflow here first for a maintainer
to promote is optional. Sessions still cannot push tags, so a maintainer
pushes any tag that a tag-triggered workflow needs.

## Promoted, 2026-09-22

Everything that was staged here is now live, moved by the rollout script
rather than edited: `workflows/ci.yml` and `workflows/record.yml`, with
the Rust toolchain print and the `cargo fetch --locked`, and
`workflows/docs.yml`, the prose gate. Each is the file of the same name
in `.github/workflows/`. Nothing is pending. Read the workflows
themselves rather than a description of them here.
