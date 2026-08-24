# Tabnas measurement — 20260824T180228785Z-60c854374a1f-suite-0.1.0-dce65958

Generated 2026-08-24T18:02:28.785Z from suite `0.1.0` at commit `dce6595872eaac175f61ba4f9d948cde3ae44a0d`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `60c854374a1f` |
| Operating system | `Ubuntu 24.04.4 LTS (linux/amd64)` |
| Kernel | `6.8.0-137-generic` |
| Processor | `Intel(R) Core(TM) m3-6Y30 CPU @ 0.90GHz` |
| Logical CPUs | 4 |
| Memory | 7.65 GiB (8,219,103,232 bytes) |
| Environment fingerprint | `6163022ce2b319c20cb1a337223fb3a4023207e3dc44d9875b54dfc293274ead` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.14.1 |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.1 |

## Adder grammar

Canonical Tabnas integer-addition grammar with semantic accumulation.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go |
| --- | --- | --- | --- |
| single | `1` | pass `1` | pass `1` |
| chain | `6` | pass `6` | pass `6` |
| multi-digit | `60` | pass `60` | pass `60` |
| trailing-plus | reject | pass (rejected) | pass (rejected) |
| leading-plus | reject | pass (rejected) | pass (rejected) |
| double-plus | reject | pass (rejected) | pass (rejected) |
| unknown-token | reject | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: |
| terms-8 | 15 | 17,618.87 ns / 56,757 / 1.00× | 11,707.26 ns / 85,417 / 1.51× |
| terms-64 | 127 | 116,285.92 ns / 8,599 / 1.00× | 74,308.96 ns / 13,457 / 1.57× |
| terms-512 | 1023 | 912,694.43 ns / 1,096 / 1.00× | 572,293.46 ns / 1,747 / 1.60× |
| terms-4096 | 8191 | 8,053,043.38 ns / 124 / 1.00× | 5,598,786.50 ns / 179 / 1.44× |

## Even palindromes

Classic non-deterministic context-free language resolved with full parse context.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go |
| --- | --- | --- | --- |
| empty | `true` | pass `true` | pass `true` |
| pair-a | `true` | pass `true` | pass `true` |
| pair-b | `true` | pass `true` | pass `true` |
| nested | `true` | pass `true` | pass `true` |
| length-six | `true` | pass `true` | pass `true` |
| odd-length | reject | pass (rejected) | pass (rejected) |
| not-mirrored | reject | pass (rejected) | pass (rejected) |
| wrong-close | reject | pass (rejected) | pass (rejected) |
| outside-alphabet | reject | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: |
| chars-16 | 16 | 20,136.45 ns / 49,661 / 1.00× | 13,536.69 ns / 73,873 / 1.49× |
| chars-128 | 128 | 121,449.84 ns / 8,234 / 1.00× | 81,681.02 ns / 12,243 / 1.49× |
| chars-1024 | 1024 | 957,020.88 ns / 1,045 / 1.00× | 659,405.79 ns / 1,517 / 1.45× |
| chars-8192 | 8192 | 7,946,660.94 ns / 126 / 1.05× | 8,333,684.44 ns / 120 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
