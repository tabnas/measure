# Tabnas measurement — 20260915T204238333Z-063cd3b35d2f-suite-0.2.0-40411295

Generated 2026-09-15T20:42:38.333Z from suite `0.2.0` at commit `40411295127930592d3d93ea5b69541336e26eb1`.

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
| TypeScript / Node.js | `@tabnas/parser@0.9.7` | Node.js v22.22.2 |
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
| terms-8 | 15 | 10,992.97 ns / 90,967 / 1.62× | 7,058.62 ns / 141,671 / 2.52× | 17,762.69 ns / 56,298 / 1.00× |
| terms-64 | 127 | 75,393.29 ns / 13,264 / 1.70× | 44,718.50 ns / 22,362 / 2.87× | 128,176.40 ns / 7,802 / 1.00× |
| terms-512 | 1023 | 613,529.72 ns / 1,630 / 1.70× | 342,194.70 ns / 2,922 / 3.05× | 1,044,282.30 ns / 958 / 1.00× |
| terms-1024 | 2047 | 1,186,086.82 ns / 843 / 1.74× | 728,530.61 ns / 1,373 / 2.84× | 2,067,590.70 ns / 484 / 1.00× |
| terms-2048 | 4095 | 2,485,078.36 ns / 402 / 1.71× | 1,566,350.77 ns / 638 / 2.72× | 4,254,996.50 ns / 235 / 1.00× |
| terms-4096 | 8191 | 5,314,116.69 ns / 188 / 1.63× | 3,148,579.75 ns / 318 / 2.75× | 8,672,461.63 ns / 115 / 1.00× |
| terms-8192 | 16383 | 13,520,510.00 ns / 74 / 1.34× | 7,740,652.69 ns / 129 / 2.35× | 18,171,436.63 ns / 55 / 1.00× |
| terms-16384 | 32767 | 39,746,948.75 ns / 25 / 1.00× | 14,923,303.38 ns / 67 / 2.66× | 37,580,976.00 ns / 27 / 1.06× |

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
| chars-16 | 16 | 11,705.99 ns / 85,426 / 1.95× | 8,347.11 ns / 119,802 / 2.74× | 22,860.76 ns / 43,743 / 1.00× |
| chars-128 | 128 | 74,215.01 ns / 13,474 / 2.06× | 49,415.96 ns / 20,236 / 3.10× | 152,997.23 ns / 6,536 / 1.00× |
| chars-1024 | 1024 | 605,130.90 ns / 1,653 / 2.10× | 423,312.51 ns / 2,362 / 3.00× | 1,271,710.30 ns / 786 / 1.00× |
| chars-2048 | 2048 | 1,110,912.03 ns / 900 / 2.34× | 820,172.38 ns / 1,219 / 3.18× | 2,603,694.81 ns / 384 / 1.00× |
| chars-4096 | 4096 | 2,322,808.02 ns / 431 / 2.31× | 2,195,775.70 ns / 455 / 2.44× | 5,356,424.91 ns / 187 / 1.00× |
| chars-8192 | 8192 | 4,782,025.84 ns / 209 / 2.35× | 4,980,268.34 ns / 201 / 2.26× | 11,236,478.63 ns / 89 / 1.00× |
| chars-16384 | 16384 | 11,413,313.31 ns / 88 / 2.13× | 8,397,380.50 ns / 119 / 2.89× | 24,283,886.75 ns / 41 / 1.00× |
| chars-32768 | 32768 | 32,733,682.25 ns / 31 / 1.51× | 15,564,925.75 ns / 64 / 3.17× | 49,404,453.50 ns / 20 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
