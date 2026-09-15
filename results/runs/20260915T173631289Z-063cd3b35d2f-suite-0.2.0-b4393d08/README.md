# Tabnas measurement — 20260915T173631289Z-063cd3b35d2f-suite-0.2.0-b4393d08

Generated 2026-09-15T17:36:31.289Z from suite `0.2.0` at commit `b4393d085cf336d98af859758652d7c508d879e1`.

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
| terms-8 | 15 | 12,330.26 ns / 81,101 / 3.01× | 7,771.17 ns / 128,681 / 4.77× | 37,084.09 ns / 26,966 / 1.00× |
| terms-64 | 127 | 78,735.98 ns / 12,701 / 2.86× | 48,741.29 ns / 20,516 / 4.61× | 224,820.94 ns / 4,448 / 1.00× |
| terms-512 | 1023 | 605,506.97 ns / 1,652 / 2.75× | 380,348.73 ns / 2,629 / 4.38× | 1,665,339.09 ns / 600 / 1.00× |
| terms-1024 | 2047 | 1,228,868.52 ns / 814 / 2.72× | 771,235.08 ns / 1,297 / 4.33× | 3,341,047.91 ns / 299 / 1.00× |
| terms-2048 | 4095 | 2,480,783.17 ns / 403 / 2.76× | 1,691,920.63 ns / 591 / 4.05× | 6,850,812.44 ns / 146 / 1.00× |
| terms-4096 | 8191 | 4,882,768.75 ns / 205 / 2.93× | 3,395,706.75 ns / 294 / 4.21× | 14,296,335.25 ns / 70 / 1.00× |
| terms-8192 | 16383 | 9,226,811.38 ns / 108 / 3.29× | 8,059,381.19 ns / 124 / 3.76× | 30,333,981.00 ns / 33 / 1.00× |
| terms-16384 | 32767 | 18,809,496.75 ns / 53 / 3.42× | 16,065,313.50 ns / 62 / 4.00× | 64,280,766.50 ns / 16 / 1.00× |

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
| chars-16 | 16 | 11,801.58 ns / 84,734 / 4.19× | 9,185.83 ns / 108,863 / 5.38× | 49,421.44 ns / 20,234 / 1.00× |
| chars-128 | 128 | 77,024.13 ns / 12,983 / 3.57× | 50,931.15 ns / 19,634 / 5.39× | 274,660.87 ns / 3,641 / 1.00× |
| chars-1024 | 1024 | 595,109.46 ns / 1,680 / 3.34× | 439,371.52 ns / 2,276 / 4.52× | 1,985,230.67 ns / 504 / 1.00× |
| chars-2048 | 2048 | 1,132,578.34 ns / 883 / 3.53× | 882,423.07 ns / 1,133 / 4.53× | 4,001,045.34 ns / 250 / 1.00× |
| chars-4096 | 4096 | 2,345,213.63 ns / 426 / 3.59× | 2,300,103.81 ns / 435 / 3.66× | 8,422,140.13 ns / 119 / 1.00× |
| chars-8192 | 8192 | 4,868,599.06 ns / 205 / 3.84× | 4,825,516.16 ns / 207 / 3.88× | 18,700,398.13 ns / 53 / 1.00× |
| chars-16384 | 16384 | 9,543,820.94 ns / 105 / 4.66× | 8,670,648.75 ns / 115 / 5.13× | 44,484,397.25 ns / 22 / 1.00× |
| chars-32768 | 32768 | 19,677,731.63 ns / 51 / 4.74× | 15,783,211.88 ns / 63 / 5.91× | 93,312,004.50 ns / 11 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
