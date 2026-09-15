# Tabnas measurement — 20260915T144739631Z-063cd3b35d2f-suite-0.2.0-227c4c87

Generated 2026-09-15T14:47:39.631Z from suite `0.2.0` at commit `227c4c87d6d8311bba6f77cab9157b83c4a12e47`.

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
| terms-8 | 15 | 11,284.26 ns / 88,619 / 6.46× | 7,127.61 ns / 140,299 / 10.23× | 72,930.76 ns / 13,712 / 1.00× |
| terms-64 | 127 | 77,817.45 ns / 12,851 / 4.24× | 47,545.89 ns / 21,032 / 6.95× | 330,202.94 ns / 3,028 / 1.00× |
| terms-512 | 1023 | 611,511.35 ns / 1,635 / 3.81× | 360,467.99 ns / 2,774 / 6.46× | 2,326,858.63 ns / 430 / 1.00× |
| terms-1024 | 2047 | 1,215,482.12 ns / 823 / 3.79× | 743,508.54 ns / 1,345 / 6.20× | 4,608,603.56 ns / 217 / 1.00× |
| terms-2048 | 4095 | 2,452,643.56 ns / 408 / 3.97× | 1,686,314.52 ns / 593 / 5.78× | 9,744,737.69 ns / 103 / 1.00× |
| terms-4096 | 8191 | 4,801,115.84 ns / 208 / 4.48× | 3,328,382.41 ns / 300 / 6.46× | 21,486,551.13 ns / 47 / 1.00× |
| terms-8192 | 16383 | 9,106,381.63 ns / 110 / 5.37× | 8,244,230.31 ns / 121 / 5.93× | 48,916,941.00 ns / 20 / 1.00× |
| terms-16384 | 32767 | 19,599,346.50 ns / 51 / 4.99× | 15,913,167.88 ns / 63 / 6.14× | 97,772,774.50 ns / 10 / 1.00× |

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
| chars-16 | 16 | 11,980.64 ns / 83,468 / 9.00× | 8,789.24 ns / 113,775 / 12.27× | 107,865.90 ns / 9,271 / 1.00× |
| chars-128 | 128 | 77,698.03 ns / 12,870 / 6.30× | 55,397.58 ns / 18,051 / 8.83× | 489,081.54 ns / 2,045 / 1.00× |
| chars-1024 | 1024 | 601,772.66 ns / 1,662 / 6.16× | 421,635.95 ns / 2,372 / 8.79× | 3,706,712.91 ns / 270 / 1.00× |
| chars-2048 | 2048 | 1,152,664.20 ns / 868 / 6.82× | 844,237.54 ns / 1,185 / 9.31× | 7,858,459.25 ns / 127 / 1.00× |
| chars-4096 | 4096 | 2,332,623.05 ns / 429 / 8.55× | 2,212,946.02 ns / 452 / 9.01× | 19,934,116.63 ns / 50 / 1.00× |
| chars-8192 | 8192 | 4,764,252.19 ns / 210 / 8.74× | 4,972,881.69 ns / 201 / 8.37× | 41,632,453.25 ns / 24 / 1.00× |
| chars-16384 | 16384 | 9,612,641.44 ns / 104 / 8.96× | 8,999,178.13 ns / 111 / 9.57× | 86,148,784.00 ns / 12 / 1.00× |
| chars-32768 | 32768 | 19,861,532.13 ns / 50 / 8.81× | 16,132,821.63 ns / 62 / 10.85× | 174,981,329.00 ns / 6 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
