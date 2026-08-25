# Tabnas measurement — 20260825T152240338Z-fee6c88dd0dc-suite-0.1.0-a1efc476

Generated 2026-08-25T15:22:40.338Z from suite `0.1.0` at commit `a1efc476626b0b0b01c09bb0296defe8135ebbd1`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `fee6c88dd0dc` |
| Operating system | `darwin (darwin/arm64)` |
| Kernel | `25.6.0` |
| Processor | `Apple M4` |
| Logical CPUs | 10 |
| Memory | 24.00 GiB (25,769,803,776 bytes) |
| Environment fingerprint | `01316d6d95918ed0b77a4b12e3d9242a05f989b4c5b957844a1d72042b4b7589` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.14.1 |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.3 |

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
| terms-8 | 15 | 3,146.63 ns / 317,800 / 1.00× | 2,144.09 ns / 466,397 / 1.47× |
| terms-64 | 127 | 21,429.32 ns / 46,665 / 1.00× | 13,431.22 ns / 74,453 / 1.60× |
| terms-512 | 1023 | 168,201.74 ns / 5,945 / 1.00× | 107,387.74 ns / 9,312 / 1.57× |
| terms-4096 | 8191 | 1,363,123.70 ns / 734 / 1.00× | 983,454.10 ns / 1,017 / 1.39× |

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
| chars-16 | 16 | 3,687.12 ns / 271,214 / 1.00× | 2,598.44 ns / 384,847 / 1.42× |
| chars-128 | 128 | 22,749.92 ns / 43,956 / 1.00× | 15,618.95 ns / 64,025 / 1.46× |
| chars-1024 | 1024 | 175,607.58 ns / 5,695 / 1.00× | 132,548.99 ns / 7,544 / 1.33× |
| chars-8192 | 8192 | 1,422,964.20 ns / 703 / 1.00× | 1,409,355.15 ns / 710 / 1.01× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
