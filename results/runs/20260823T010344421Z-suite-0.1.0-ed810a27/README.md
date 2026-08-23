# Tabnas measurement — 20260823T010344421Z-suite-0.1.0-ed810a27

Generated 2026-08-23T01:03:44.421Z from suite `0.1.0` at commit `ed810a2761f16b6d96e6dfca7c3062c4f18d0e5f`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Ports and environment

| Port | Parser | Runtime | Host fingerprint |
| --- | --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.14.1 | `59e2714e366f` |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.1 | `59e2714e366f` |

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
| terms-8 | 15 | 45,996.07 ns / 21,741 / 1.06× | 48,693.09 ns / 20,537 / 1.00× |
| terms-64 | 127 | 325,761.62 ns / 3,070 / 1.00× | 309,473.35 ns / 3,231 / 1.05× |
| terms-512 | 1023 | 2,304,266.89 ns / 434 / 1.09× | 2,506,947.33 ns / 399 / 1.00× |
| terms-4096 | 8191 | 18,244,982.25 ns / 55 / 1.13× | 20,600,095.00 ns / 49 / 1.00× |

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
| chars-16 | 16 | 49,494.51 ns / 20,204 / 1.05× | 51,942.50 ns / 19,252 / 1.00× |
| chars-128 | 128 | 298,852.40 ns / 3,346 / 1.19× | 356,535.63 ns / 2,805 / 1.00× |
| chars-1024 | 1024 | 2,207,946.14 ns / 453 / 1.06× | 2,336,014.19 ns / 428 / 1.00× |
| chars-8192 | 8192 | 18,043,939.13 ns / 55 / 1.31× | 23,717,532.75 ns / 42 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
