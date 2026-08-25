# Tabnas measurement — 20260825T154057262Z-fee6c88dd0dc-suite-0.1.0-02303907

Generated 2026-08-25T15:40:57.262Z from suite `0.1.0` at commit `02303907920209681b0a573e6496608932b86d69`.

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
| terms-8 | 15 | 3,118.96 ns / 320,620 / 1.00× | 2,148.54 ns / 465,432 / 1.45× |
| terms-64 | 127 | 21,793.35 ns / 45,886 / 1.00× | 13,477.30 ns / 74,199 / 1.62× |
| terms-512 | 1023 | 169,791.18 ns / 5,890 / 1.00× | 107,644.53 ns / 9,290 / 1.58× |
| terms-4096 | 8191 | 1,367,860.35 ns / 731 / 1.00× | 990,728.84 ns / 1,009 / 1.38× |

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
| chars-16 | 16 | 3,652.84 ns / 273,760 / 1.00× | 2,586.47 ns / 386,627 / 1.41× |
| chars-128 | 128 | 22,742.41 ns / 43,971 / 1.00× | 15,568.91 ns / 64,231 / 1.46× |
| chars-1024 | 1024 | 175,251.63 ns / 5,706 / 1.00× | 132,625.65 ns / 7,540 / 1.32× |
| chars-8192 | 8192 | 1,417,008.46 ns / 706 / 1.00× | 1,401,695.31 ns / 713 / 1.01× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
