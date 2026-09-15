# Tabnas measurement — 20260915T212322908Z-063cd3b35d2f-suite-0.2.0-76deaef3

Generated 2026-09-15T21:23:22.908Z from suite `0.2.0` at commit `76deaef37f16d59ea1dfd7fd276a137396e56c43`.

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
| terms-8 | 15 | 10,729.74 ns / 93,199 / 1.58× | 7,123.44 ns / 140,382 / 2.38× | 16,927.65 ns / 59,075 / 1.00× |
| terms-64 | 127 | 74,612.39 ns / 13,403 / 1.66× | 45,514.33 ns / 21,971 / 2.73× | 124,034.49 ns / 8,062 / 1.00× |
| terms-512 | 1023 | 606,728.07 ns / 1,648 / 1.67× | 363,583.46 ns / 2,750 / 2.78× | 1,010,776.80 ns / 989 / 1.00× |
| terms-1024 | 2047 | 1,161,607.37 ns / 861 / 1.75× | 699,019.51 ns / 1,431 / 2.91× | 2,037,244.38 ns / 491 / 1.00× |
| terms-2048 | 4095 | 2,419,434.36 ns / 413 / 1.69× | 1,615,675.92 ns / 619 / 2.53× | 4,080,843.88 ns / 245 / 1.00× |
| terms-4096 | 8191 | 5,240,124.19 ns / 191 / 1.59× | 3,265,929.27 ns / 306 / 2.55× | 8,330,661.31 ns / 120 / 1.00× |
| terms-8192 | 16383 | 13,768,228.25 ns / 73 / 1.26× | 8,053,576.31 ns / 124 / 2.16× | 17,395,124.88 ns / 57 / 1.00× |
| terms-16384 | 32767 | 38,124,519.50 ns / 26 / 1.00× | 15,281,291.50 ns / 65 / 2.50× | 35,575,588.50 ns / 28 / 1.07× |

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
| chars-16 | 16 | 11,762.95 ns / 85,013 / 1.84× | 8,388.91 ns / 119,205 / 2.59× | 21,682.02 ns / 46,121 / 1.00× |
| chars-128 | 128 | 73,358.33 ns / 13,632 / 1.98× | 49,648.99 ns / 20,141 / 2.92× | 144,848.93 ns / 6,904 / 1.00× |
| chars-1024 | 1024 | 600,606.23 ns / 1,665 / 2.01× | 444,844.17 ns / 2,248 / 2.71× | 1,204,641.82 ns / 830 / 1.00× |
| chars-2048 | 2048 | 1,235,321.70 ns / 810 / 1.97× | 931,422.91 ns / 1,074 / 2.61× | 2,429,520.47 ns / 412 / 1.00× |
| chars-4096 | 4096 | 2,362,096.64 ns / 423 / 2.07× | 2,526,021.53 ns / 396 / 1.94× | 4,899,091.56 ns / 204 / 1.00× |
| chars-8192 | 8192 | 4,762,125.53 ns / 210 / 2.21× | 5,254,074.81 ns / 190 / 2.00× | 10,516,698.19 ns / 95 / 1.00× |
| chars-16384 | 16384 | 11,106,254.69 ns / 90 / 2.17× | 9,972,810.31 ns / 100 / 2.42× | 24,127,976.63 ns / 41 / 1.00× |
| chars-32768 | 32768 | 33,147,940.50 ns / 30 / 1.42× | 18,607,431.75 ns / 54 / 2.52× | 46,932,461.25 ns / 21 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
