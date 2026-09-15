# Tabnas measurement — 20260915T220022449Z-063cd3b35d2f-suite-0.2.0-446def86

Generated 2026-09-15T22:00:22.449Z from suite `0.2.0` at commit `446def86704233c82f80fffbcad2ed4bb6005325`.

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
| terms-8 | 15 | 10,188.41 ns / 98,151 / 1.60× | 7,691.63 ns / 130,011 / 2.12× | 16,306.62 ns / 61,325 / 1.00× |
| terms-64 | 127 | 73,266.65 ns / 13,649 / 1.61× | 47,221.04 ns / 21,177 / 2.49× | 117,744.86 ns / 8,493 / 1.00× |
| terms-512 | 1023 | 583,235.46 ns / 1,715 / 1.65× | 379,966.37 ns / 2,632 / 2.54× | 963,427.16 ns / 1,038 / 1.00× |
| terms-1024 | 2047 | 1,174,897.30 ns / 851 / 1.65× | 747,470.45 ns / 1,338 / 2.59× | 1,935,402.19 ns / 517 / 1.00× |
| terms-2048 | 4095 | 2,486,983.88 ns / 402 / 1.56× | 1,683,147.52 ns / 594 / 2.31× | 3,880,374.41 ns / 258 / 1.00× |
| terms-4096 | 8191 | 5,124,671.16 ns / 195 / 1.53× | 3,363,514.91 ns / 297 / 2.33× | 7,827,818.00 ns / 128 / 1.00× |
| terms-8192 | 16383 | 12,678,286.63 ns / 79 / 1.31× | 8,273,953.75 ns / 121 / 2.01× | 16,610,117.50 ns / 60 / 1.00× |
| terms-16384 | 32767 | 37,998,460.75 ns / 26 / 1.00× | 15,766,728.13 ns / 63 / 2.41× | 33,776,277.25 ns / 30 / 1.13× |

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
| chars-16 | 16 | 11,424.20 ns / 87,533 / 1.88× | 9,124.27 ns / 109,598 / 2.36× | 21,497.10 ns / 46,518 / 1.00× |
| chars-128 | 128 | 73,323.42 ns / 13,638 / 1.97× | 54,894.43 ns / 18,217 / 2.63× | 144,544.63 ns / 6,918 / 1.00× |
| chars-1024 | 1024 | 568,030.69 ns / 1,760 / 2.11× | 431,362.68 ns / 2,318 / 2.78× | 1,199,990.25 ns / 833 / 1.00× |
| chars-2048 | 2048 | 1,144,595.78 ns / 874 / 2.10× | 900,174.48 ns / 1,111 / 2.67× | 2,406,365.64 ns / 416 / 1.00× |
| chars-4096 | 4096 | 2,316,182.28 ns / 432 / 2.08× | 2,117,221.89 ns / 472 / 2.27× | 4,812,645.72 ns / 208 / 1.00× |
| chars-8192 | 8192 | 4,791,230.16 ns / 209 / 2.12× | 4,465,941.19 ns / 224 / 2.28× | 10,159,505.56 ns / 98 / 1.00× |
| chars-16384 | 16384 | 11,267,402.69 ns / 89 / 2.03× | 8,196,232.31 ns / 122 / 2.80× | 22,922,965.25 ns / 44 / 1.00× |
| chars-32768 | 32768 | 33,046,785.00 ns / 30 / 1.41× | 16,893,729.38 ns / 59 / 2.77× | 46,725,401.00 ns / 21 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
