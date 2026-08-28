# Tabnas measurement — 20260828T180514831Z-1a339841a70d-suite-0.1.0-28ed23bb

Generated 2026-08-28T18:05:14.831Z from suite `0.1.0` at commit `28ed23bb5a41c885938628b7e929eb20f2b79d4e`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `1a339841a70d` |
| Operating system | `darwin (darwin/amd64)` |
| Kernel | `21.6.0` |
| Processor | `Intel(R) Core(TM) i7-6660U CPU @ 2.40GHz` |
| Logical CPUs | 4 |
| Memory | 16.00 GiB (17,179,869,184 bytes) |
| Environment fingerprint | `4f7afaa40f2615e34299a044dd578f7f7c925a2a0f1ff691d6a960ca482d21c2` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.11.1 |
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
| terms-8 | 15 | 14,539.09 ns / 68,780 / 1.00× | 9,490.45 ns / 105,369 / 1.53× |
| terms-64 | 127 | 102,574.96 ns / 9,749 / 1.00× | 61,169.92 ns / 16,348 / 1.68× |
| terms-512 | 1023 | 762,686.12 ns / 1,311 / 1.00× | 458,193.84 ns / 2,182 / 1.67× |
| terms-4096 | 8191 | 6,402,673.56 ns / 156 / 1.00× | 4,102,132.44 ns / 244 / 1.56× |

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
| chars-16 | 16 | 17,065.41 ns / 58,598 / 1.00× | 10,491.43 ns / 95,316 / 1.63× |
| chars-128 | 128 | 96,330.03 ns / 10,381 / 1.00× | 61,110.11 ns / 16,364 / 1.58× |
| chars-1024 | 1024 | 803,439.22 ns / 1,245 / 1.00× | 494,250.32 ns / 2,023 / 1.63× |
| chars-8192 | 8192 | 6,530,261.00 ns / 153 / 1.00× | 5,849,112.28 ns / 171 / 1.12× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
