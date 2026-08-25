# Tabnas measurement — 20260825T144635330Z-fee6c88dd0dc-suite-0.1.0-a9492291

Generated 2026-08-25T14:46:35.330Z from suite `0.1.0` at commit `a94922916ea7299c15ece8d40d838e400023ec40`.

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
| terms-8 | 15 | 3,164.69 ns / 315,986 / 1.00× | 2,164.09 ns / 462,089 / 1.46× |
| terms-64 | 127 | 21,787.73 ns / 45,897 / 1.00× | 13,585.68 ns / 73,607 / 1.60× |
| terms-512 | 1023 | 168,923.87 ns / 5,920 / 1.00× | 108,208.41 ns / 9,241 / 1.56× |
| terms-4096 | 8191 | 1,359,394.20 ns / 736 / 1.00× | 992,664.06 ns / 1,007 / 1.37× |

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
| chars-16 | 16 | 3,692.64 ns / 270,809 / 1.00× | 2,575.56 ns / 388,265 / 1.43× |
| chars-128 | 128 | 22,748.45 ns / 43,959 / 1.00× | 15,474.83 ns / 64,621 / 1.47× |
| chars-1024 | 1024 | 175,440.75 ns / 5,700 / 1.00× | 131,577.64 ns / 7,600 / 1.33× |
| chars-8192 | 8192 | 1,421,330.08 ns / 704 / 1.01× | 1,434,461.91 ns / 697 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
