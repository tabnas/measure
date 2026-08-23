# Contributing

Changes should preserve the measurement invariants in [`AGENTS.md`](AGENTS.md)
and the interpretation rules in [`docs/methodology.md`](docs/methodology.md).

Before opening a change:

```sh
npm ci
GOWORK=off go mod download
make test
```

Run `make measure` only when a new committed measurement is intentional.
Documentation or site-only changes should use `make site` instead.

Commit messages use Conventional Commits, for example:

```text
feat: add palindrome benchmark matrix
fix: reject mismatched cross-port inputs
docs: clarify warmup methodology
```
