# Tabnas measurement — 20260828T182125848Z-1a339841a70d-suite-0.2.0-f1a64870

Generated 2026-08-28T18:21:25.848Z from suite `0.2.0` at commit `f1a6487022a132f9f05f485cd313cdb13c37405e`.

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
| terms-8 | 15 | 14,042.47 ns / 71,213 / 1.00× | 8,815.58 ns / 113,436 / 1.59× |
| terms-64 | 127 | 94,159.75 ns / 10,620 / 1.00× | 57,113.81 ns / 17,509 / 1.65× |
| terms-512 | 1023 | 727,222.82 ns / 1,375 / 1.00× | 457,095.31 ns / 2,188 / 1.59× |
| terms-1024 | 2047 | 1,466,531.05 ns / 682 / 1.00× | 888,896.01 ns / 1,125 / 1.65× |
| terms-2048 | 4095 | 2,958,484.08 ns / 338 / 1.00× | 2,016,102.52 ns / 496 / 1.47× |
| terms-4096 | 8191 | 5,862,120.56 ns / 171 / 1.00× | 4,046,603.59 ns / 247 / 1.45× |
| terms-8192 | 16383 | 11,820,452.25 ns / 85 / 1.00× | 9,464,823.38 ns / 106 / 1.25× |
| terms-16384 | 32767 | 22,778,982.25 ns / 44 / 1.00× | 18,724,704.00 ns / 53 / 1.22× |

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
| chars-16 | 16 | 16,268.90 ns / 61,467 / 1.00× | 10,052.76 ns / 99,475 / 1.62× |
| chars-128 | 128 | 99,785.57 ns / 10,021 / 1.00× | 58,317.02 ns / 17,148 / 1.71× |
| chars-1024 | 1024 | 789,345.00 ns / 1,267 / 1.00× | 485,235.69 ns / 2,061 / 1.63× |
| chars-2048 | 2048 | 1,491,056.57 ns / 671 / 1.00× | 1,103,646.55 ns / 906 / 1.35× |
| chars-4096 | 4096 | 3,022,801.31 ns / 331 / 1.00× | 2,699,429.23 ns / 370 / 1.12× |
| chars-8192 | 8192 | 5,902,370.44 ns / 169 / 1.00× | 5,715,146.84 ns / 175 / 1.03× |
| chars-16384 | 16384 | 12,405,042.25 ns / 81 / 1.00× | 11,261,333.00 ns / 89 / 1.10× |
| chars-32768 | 32768 | 25,433,746.00 ns / 39 / 1.00× | 22,620,691.75 ns / 44 / 1.12× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
