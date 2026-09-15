# Tabnas measurement — 20260915T160653387Z-063cd3b35d2f-suite-0.2.0-302a4d83

Generated 2026-09-15T16:06:53.387Z from suite `0.2.0` at commit `302a4d83c76564cb6cffe5e5aece29bde1e406df`.

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
| terms-8 | 15 | 11,837.42 ns / 84,478 / 5.41× | 7,453.76 ns / 134,160 / 8.59× | 63,996.39 ns / 15,626 / 1.00× |
| terms-64 | 127 | 79,154.34 ns / 12,634 / 3.39× | 47,120.79 ns / 21,222 / 5.70× | 268,512.55 ns / 3,724 / 1.00× |
| terms-512 | 1023 | 617,256.45 ns / 1,620 / 2.99× | 389,490.00 ns / 2,567 / 4.73× | 1,843,645.08 ns / 542 / 1.00× |
| terms-1024 | 2047 | 1,232,637.77 ns / 811 / 3.03× | 715,631.82 ns / 1,397 / 5.22× | 3,733,326.81 ns / 268 / 1.00× |
| terms-2048 | 4095 | 2,405,429.63 ns / 416 / 3.24× | 1,750,437.91 ns / 571 / 4.45× | 7,792,427.13 ns / 128 / 1.00× |
| terms-4096 | 8191 | 4,918,015.78 ns / 203 / 3.49× | 3,390,768.53 ns / 295 / 5.06× | 17,138,910.50 ns / 58 / 1.00× |
| terms-8192 | 16383 | 9,450,758.00 ns / 106 / 3.95× | 8,446,871.19 ns / 118 / 4.41× | 37,279,056.75 ns / 27 / 1.00× |
| terms-16384 | 32767 | 18,479,925.63 ns / 54 / 4.25× | 15,184,648.50 ns / 66 / 5.17× | 78,456,375.00 ns / 13 / 1.00× |

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
| chars-16 | 16 | 12,114.76 ns / 82,544 / 6.77× | 8,353.32 ns / 119,713 / 9.81× | 81,951.69 ns / 12,202 / 1.00× |
| chars-128 | 128 | 76,010.34 ns / 13,156 / 4.42× | 55,523.27 ns / 18,010 / 6.05× | 335,618.61 ns / 2,980 / 1.00× |
| chars-1024 | 1024 | 612,015.34 ns / 1,634 / 3.93× | 462,285.10 ns / 2,163 / 5.20× | 2,402,470.44 ns / 416 / 1.00× |
| chars-2048 | 2048 | 1,184,255.07 ns / 844 / 4.30× | 851,123.95 ns / 1,175 / 5.98× | 5,089,798.88 ns / 196 / 1.00× |
| chars-4096 | 4096 | 2,434,714.53 ns / 411 / 4.59× | 2,276,953.19 ns / 439 / 4.90× | 11,163,488.00 ns / 90 / 1.00× |
| chars-8192 | 8192 | 4,861,752.97 ns / 206 / 5.69× | 5,013,526.13 ns / 199 / 5.52× | 27,650,017.25 ns / 36 / 1.00× |
| chars-16384 | 16384 | 9,812,823.31 ns / 102 / 5.94× | 9,820,556.81 ns / 102 / 5.93× | 58,246,763.50 ns / 17 / 1.00× |
| chars-32768 | 32768 | 19,925,636.88 ns / 50 / 6.13× | 18,015,258.00 ns / 56 / 6.78× | 122,125,240.00 ns / 8 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
