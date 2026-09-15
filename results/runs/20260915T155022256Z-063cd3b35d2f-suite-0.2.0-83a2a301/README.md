# Tabnas measurement — 20260915T155022256Z-063cd3b35d2f-suite-0.2.0-83a2a301

Generated 2026-09-15T15:50:22.256Z from suite `0.2.0` at commit `83a2a301209c747ad65066f7a002ed583a55d355`.

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
| terms-8 | 15 | 11,862.24 ns / 84,301 / 5.75× | 7,659.46 ns / 130,557 / 8.91× | 68,214.69 ns / 14,660 / 1.00× |
| terms-64 | 127 | 75,044.44 ns / 13,325 / 3.98× | 49,649.59 ns / 20,141 / 6.01× | 298,518.05 ns / 3,350 / 1.00× |
| terms-512 | 1023 | 607,433.86 ns / 1,646 / 3.29× | 384,589.34 ns / 2,600 / 5.20× | 1,999,847.77 ns / 500 / 1.00× |
| terms-1024 | 2047 | 1,226,085.98 ns / 816 / 3.35× | 772,651.00 ns / 1,294 / 5.31× | 4,105,495.38 ns / 244 / 1.00× |
| terms-2048 | 4095 | 2,377,269.59 ns / 421 / 3.56× | 1,717,865.91 ns / 582 / 4.93× | 8,467,560.56 ns / 118 / 1.00× |
| terms-4096 | 8191 | 4,788,721.22 ns / 209 / 3.64× | 3,368,766.94 ns / 297 / 5.17× | 17,411,924.63 ns / 57 / 1.00× |
| terms-8192 | 16383 | 9,908,786.44 ns / 101 / 3.86× | 8,081,617.75 ns / 124 / 4.74× | 38,283,433.25 ns / 26 / 1.00× |
| terms-16384 | 32767 | 18,071,049.25 ns / 55 / 4.37× | 15,783,429.38 ns / 63 / 5.00× | 78,876,913.50 ns / 13 / 1.00× |

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
| chars-16 | 16 | 11,934.12 ns / 83,793 / 7.13× | 8,758.23 ns / 114,178 / 9.72× | 85,096.12 ns / 11,751 / 1.00× |
| chars-128 | 128 | 75,327.52 ns / 13,275 / 4.76× | 57,306.15 ns / 17,450 / 6.26× | 358,700.79 ns / 2,788 / 1.00× |
| chars-1024 | 1024 | 603,650.26 ns / 1,657 / 4.19× | 455,174.81 ns / 2,197 / 5.56× | 2,530,674.13 ns / 395 / 1.00× |
| chars-2048 | 2048 | 1,162,057.08 ns / 861 / 4.61× | 943,457.62 ns / 1,060 / 5.68× | 5,353,663.06 ns / 187 / 1.00× |
| chars-4096 | 4096 | 2,330,198.22 ns / 429 / 4.89× | 2,345,834.75 ns / 426 / 4.86× | 11,392,735.50 ns / 88 / 1.00× |
| chars-8192 | 8192 | 4,680,094.44 ns / 214 / 5.63× | 5,658,990.22 ns / 177 / 4.66× | 26,367,171.50 ns / 38 / 1.00× |
| chars-16384 | 16384 | 9,460,908.38 ns / 106 / 6.00× | 10,038,447.25 ns / 100 / 5.65× | 56,719,667.50 ns / 18 / 1.00× |
| chars-32768 | 32768 | 19,601,830.88 ns / 51 / 5.72× | 17,437,062.50 ns / 57 / 6.43× | 112,181,221.00 ns / 9 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
