# Results

`runs/<run-id>/` contains immutable measurements. Each complete run has:

- `definitions/`: the exact config, schemas, manifests, and generated input
  sources used for that run;
- `raw/<port-id>.json`: raw capability outcomes and timing samples;
- `matrix.json`: validated cross-port comparison data;
- `README.md`: generated human-readable matrix.

`latest/` is a generated copy of the newest complete committed run.
`index.json` is the machine-readable catalog consumed by the Pages build.
It preserves per-port parser versions and environment fingerprints so the site
can add new releases and ports without rewriting old rows.

Do not edit generated statistics by hand. Change the harness or manifest,
create a new run, and retain the previous observation.
