# Tabnas measurement — 20260825T144124487Z-fee6c88dd0dc-suite-0.1.0-7c016950

Generated 2026-08-25T14:41:24.487Z from suite `0.1.0` at commit `7c0169505a3b2d4b80b172240c0aa04983d37356`.

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
| terms-8 | 15 | 3,119.40 ns / 320,574 / 1.00× | 2,147.21 ns / 465,721 / 1.45× |
| terms-64 | 127 | 21,569.79 ns / 46,361 / 1.00× | 13,465.74 ns / 74,263 / 1.60× |
| terms-512 | 1023 | 168,642.86 ns / 5,930 / 1.00× | 107,605.06 ns / 9,293 / 1.57× |
| terms-4096 | 8191 | 1,341,707.35 ns / 745 / 1.00× | 990,619.79 ns / 1,009 / 1.35× |

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
| chars-16 | 16 | 3,628.04 ns / 275,631 / 1.00× | 2,574.12 ns / 388,482 / 1.41× |
| chars-128 | 128 | 22,515.34 ns / 44,414 / 1.00× | 15,475.37 ns / 64,619 / 1.46× |
| chars-1024 | 1024 | 173,807.58 ns / 5,753 / 1.00× | 130,584.39 ns / 7,658 / 1.33× |
| chars-8192 | 8192 | 1,414,003.25 ns / 707 / 1.00× | 1,393,961.59 ns / 717 / 1.01× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
