# Tabnas measurement — 20260915T160917518Z-063cd3b35d2f-suite-0.2.0-dd84cf8c

Generated 2026-09-15T16:09:17.518Z from suite `0.2.0` at commit `dd84cf8cfbd7de9872d3b7d127bc7f73c361518d`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `063cd3b35d2f` |
| Operating system | `Ubuntu 24.04.4 LTS (linux/amd64)` |
| Kernel | `6.18.44-fc-v33` |
| Processor | `Intel(R) Xeon(R) Processor @ 2.80GHz` |
| Logical CPUs | 4 |
| Memory | 15.72 GiB (16,877,793,280 bytes) |
| Environment fingerprint | `2e786edca5574fb6b21f15751f3479f2a1aba3d072d6f8017da919fd2fb0956a` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.7` | Node.js v24.21.0 |
| Go | `github.com/tabnas/parser/go@0.9.7` | Go go1.26.0 |
| Rust | `tabnas@0.9.7` | Rust 1.94.1 |

## Adder grammar

Canonical Tabnas integer-addition grammar with semantic accumulation.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go | Rust |
| --- | --- | --- | --- | --- |
| single | `1` | pass `1` | pass `1` | pass `1` |
| chain | `6` | pass `6` | pass `6` | pass `6` |
| multi-digit | `60` | pass `60` | pass `60` | pass `60` |
| trailing-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| leading-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| double-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| unknown-token | reject | pass (rejected) | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative | Rust median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: | ---: |
| terms-8 | 15 | 12,037.52 ns / 83,074 / 5.38× | 7,752.64 ns / 128,988 / 8.36× | 64,789.58 ns / 15,435 / 1.00× |
| terms-64 | 127 | 77,643.91 ns / 12,879 / 3.51× | 47,556.91 ns / 21,027 / 5.73× | 272,319.84 ns / 3,672 / 1.00× |
| terms-512 | 1023 | 615,737.39 ns / 1,624 / 3.07× | 384,727.68 ns / 2,599 / 4.92× | 1,890,929.84 ns / 529 / 1.00× |
| terms-1024 | 2047 | 1,229,210.18 ns / 814 / 3.07× | 810,500.48 ns / 1,234 / 4.65× | 3,769,806.88 ns / 265 / 1.00× |
| terms-2048 | 4095 | 2,362,100.48 ns / 423 / 3.39× | 1,714,866.61 ns / 583 / 4.67× | 8,009,847.75 ns / 125 / 1.00× |
| terms-4096 | 8191 | 4,779,657.97 ns / 209 / 3.61× | 3,385,657.69 ns / 295 / 5.09× | 17,242,966.13 ns / 58 / 1.00× |
| terms-8192 | 16383 | 10,116,868.88 ns / 99 / 3.64× | 8,564,482.50 ns / 117 / 4.30× | 36,843,425.00 ns / 27 / 1.00× |
| terms-16384 | 32767 | 18,922,633.63 ns / 53 / 4.16× | 15,788,871.13 ns / 63 / 4.99× | 78,780,062.50 ns / 13 / 1.00× |

## Even palindromes

Classic non-deterministic context-free language resolved with full parse context.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go | Rust |
| --- | --- | --- | --- | --- |
| empty | `true` | pass `true` | pass `true` | pass `true` |
| pair-a | `true` | pass `true` | pass `true` | pass `true` |
| pair-b | `true` | pass `true` | pass `true` | pass `true` |
| nested | `true` | pass `true` | pass `true` | pass `true` |
| length-six | `true` | pass `true` | pass `true` | pass `true` |
| odd-length | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| not-mirrored | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| wrong-close | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| outside-alphabet | reject | pass (rejected) | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative | Rust median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: | ---: |
| chars-16 | 16 | 12,322.83 ns / 81,150 / 6.61× | 9,217.04 ns / 108,495 / 8.84× | 81,464.33 ns / 12,275 / 1.00× |
| chars-128 | 128 | 77,045.53 ns / 12,979 / 4.52× | 55,009.04 ns / 18,179 / 6.33× | 348,185.39 ns / 2,872 / 1.00× |
| chars-1024 | 1024 | 618,333.91 ns / 1,617 / 4.03× | 440,949.64 ns / 2,268 / 5.65× | 2,490,533.47 ns / 402 / 1.00× |
| chars-2048 | 2048 | 1,222,314.05 ns / 818 / 4.40× | 933,516.14 ns / 1,071 / 5.76× | 5,376,392.03 ns / 186 / 1.00× |
| chars-4096 | 4096 | 2,358,830.86 ns / 424 / 5.55× | 2,257,596.23 ns / 443 / 5.80× | 13,088,804.00 ns / 76 / 1.00× |
| chars-8192 | 8192 | 4,895,070.78 ns / 204 / 6.07× | 4,731,154.47 ns / 211 / 6.28× | 29,702,745.75 ns / 34 / 1.00× |
| chars-16384 | 16384 | 9,918,332.31 ns / 101 / 6.03× | 8,561,194.13 ns / 117 / 6.98× | 59,763,398.50 ns / 17 / 1.00× |
| chars-32768 | 32768 | 20,044,386.63 ns / 50 / 5.92× | 18,039,350.88 ns / 55 / 6.57× | 118,596,516.00 ns / 8 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
