# Tabnas measurement — 20260915T150053313Z-063cd3b35d2f-suite-0.2.0-d62043cc

Generated 2026-09-15T15:00:53.313Z from suite `0.2.0` at commit `d62043ccdbf9aebe465794a89479cb98941db3c4`.

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
| terms-8 | 15 | 11,352.93 ns / 88,083 / 6.04× | 7,855.82 ns / 127,294 / 8.73× | 68,584.85 ns / 14,580 / 1.00× |
| terms-64 | 127 | 74,053.11 ns / 13,504 / 4.23× | 48,129.67 ns / 20,777 / 6.50× | 313,014.54 ns / 3,195 / 1.00× |
| terms-512 | 1023 | 574,608.95 ns / 1,740 / 3.82× | 398,888.79 ns / 2,507 / 5.51× | 2,196,233.39 ns / 455 / 1.00× |
| terms-1024 | 2047 | 1,249,807.62 ns / 800 / 3.50× | 764,621.65 ns / 1,308 / 5.72× | 4,375,063.22 ns / 229 / 1.00× |
| terms-2048 | 4095 | 2,258,905.47 ns / 443 / 4.05× | 1,744,175.36 ns / 573 / 5.25× | 9,148,886.19 ns / 109 / 1.00× |
| terms-4096 | 8191 | 4,886,040.81 ns / 205 / 3.75× | 3,514,237.25 ns / 285 / 5.22× | 18,341,174.75 ns / 55 / 1.00× |
| terms-8192 | 16383 | 8,994,209.00 ns / 111 / 4.43× | 8,854,289.56 ns / 113 / 4.50× | 39,880,798.00 ns / 25 / 1.00× |
| terms-16384 | 32767 | 18,156,791.75 ns / 55 / 4.63× | 15,881,118.25 ns / 63 / 5.29× | 83,997,121.50 ns / 12 / 1.00× |

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
| chars-16 | 16 | 11,774.28 ns / 84,931 / 7.73× | 8,762.29 ns / 114,125 / 10.38× | 90,961.76 ns / 10,994 / 1.00× |
| chars-128 | 128 | 77,360.65 ns / 12,926 / 5.07× | 52,531.47 ns / 19,036 / 7.47× | 392,271.24 ns / 2,549 / 1.00× |
| chars-1024 | 1024 | 606,754.75 ns / 1,648 / 4.70× | 426,475.97 ns / 2,345 / 6.69× | 2,853,315.72 ns / 350 / 1.00× |
| chars-2048 | 2048 | 1,141,941.16 ns / 876 / 5.33× | 887,301.02 ns / 1,127 / 6.87× | 6,091,280.69 ns / 164 / 1.00× |
| chars-4096 | 4096 | 2,312,836.70 ns / 432 / 5.40× | 2,270,640.34 ns / 440 / 5.50× | 12,485,555.38 ns / 80 / 1.00× |
| chars-8192 | 8192 | 4,623,404.50 ns / 216 / 6.33× | 5,564,924.50 ns / 180 / 5.26× | 29,273,347.25 ns / 34 / 1.00× |
| chars-16384 | 16384 | 9,621,890.44 ns / 104 / 6.87× | 10,239,666.56 ns / 98 / 6.46× | 66,144,643.50 ns / 15 / 1.00× |
| chars-32768 | 32768 | 20,083,407.75 ns / 50 / 6.53× | 17,782,264.00 ns / 56 / 7.37× | 131,104,283.00 ns / 8 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
