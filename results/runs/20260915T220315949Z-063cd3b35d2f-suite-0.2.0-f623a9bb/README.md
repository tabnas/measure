# Tabnas measurement — 20260915T220315949Z-063cd3b35d2f-suite-0.2.0-f623a9bb

Generated 2026-09-15T22:03:15.949Z from suite `0.2.0` at commit `f623a9bb97e124286dc0cbcdfa5be8d77f319c69`.

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
| terms-8 | 15 | 10,795.81 ns / 92,629 / 1.50× | 7,900.38 ns / 126,576 / 2.05× | 16,186.65 ns / 61,779 / 1.00× |
| terms-64 | 127 | 74,354.15 ns / 13,449 / 1.58× | 44,723.30 ns / 22,360 / 2.62× | 117,326.29 ns / 8,523 / 1.00× |
| terms-512 | 1023 | 601,152.59 ns / 1,663 / 1.56× | 358,721.74 ns / 2,788 / 2.62× | 939,535.84 ns / 1,064 / 1.00× |
| terms-1024 | 2047 | 1,144,466.57 ns / 874 / 1.65× | 706,094.94 ns / 1,416 / 2.67× | 1,887,974.80 ns / 530 / 1.00× |
| terms-2048 | 4095 | 2,468,387.78 ns / 405 / 1.54× | 1,585,879.64 ns / 631 / 2.39× | 3,795,297.06 ns / 263 / 1.00× |
| terms-4096 | 8191 | 5,284,868.94 ns / 189 / 1.46× | 3,275,837.52 ns / 305 / 2.36× | 7,739,669.63 ns / 129 / 1.00× |
| terms-8192 | 16383 | 12,949,812.00 ns / 77 / 1.27× | 7,977,146.31 ns / 125 / 2.07× | 16,490,927.63 ns / 61 / 1.00× |
| terms-16384 | 32767 | 40,026,957.00 ns / 25 / 1.00× | 14,972,687.13 ns / 67 / 2.67× | 34,203,687.25 ns / 29 / 1.17× |

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
| chars-16 | 16 | 11,743.07 ns / 85,157 / 1.85× | 8,289.00 ns / 120,642 / 2.62× | 21,683.97 ns / 46,117 / 1.00× |
| chars-128 | 128 | 73,144.32 ns / 13,672 / 1.99× | 49,825.56 ns / 20,070 / 2.92× | 145,268.06 ns / 6,884 / 1.00× |
| chars-1024 | 1024 | 612,155.03 ns / 1,634 / 1.96× | 414,764.50 ns / 2,411 / 2.89× | 1,198,980.85 ns / 834 / 1.00× |
| chars-2048 | 2048 | 1,193,780.14 ns / 838 / 2.05× | 846,027.25 ns / 1,182 / 2.90× | 2,452,124.98 ns / 408 / 1.00× |
| chars-4096 | 4096 | 2,384,279.11 ns / 419 / 2.07× | 2,183,179.14 ns / 458 / 2.26× | 4,934,177.88 ns / 203 / 1.00× |
| chars-8192 | 8192 | 4,775,229.31 ns / 209 / 2.25× | 4,651,834.97 ns / 215 / 2.31× | 10,761,137.94 ns / 93 / 1.00× |
| chars-16384 | 16384 | 11,058,138.63 ns / 90 / 2.10× | 9,156,857.31 ns / 109 / 2.53× | 23,164,229.13 ns / 43 / 1.00× |
| chars-32768 | 32768 | 34,508,591.00 ns / 29 / 1.36× | 16,761,002.50 ns / 60 / 2.79× | 46,780,829.00 ns / 21 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
