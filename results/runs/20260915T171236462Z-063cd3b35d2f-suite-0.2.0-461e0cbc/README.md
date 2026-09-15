# Tabnas measurement — 20260915T171236462Z-063cd3b35d2f-suite-0.2.0-461e0cbc

Generated 2026-09-15T17:12:36.462Z from suite `0.2.0` at commit `461e0cbcd91dcfbe27d8cd69ffc2fef018a43adb`.

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
| terms-8 | 15 | 11,723.09 ns / 85,302 / 4.96× | 7,429.52 ns / 134,598 / 7.83× | 58,147.85 ns / 17,198 / 1.00× |
| terms-64 | 127 | 78,615.84 ns / 12,720 / 3.11× | 49,942.37 ns / 20,023 / 4.89× | 244,230.31 ns / 4,094 / 1.00× |
| terms-512 | 1023 | 621,581.52 ns / 1,609 / 2.73× | 372,224.72 ns / 2,687 / 4.56× | 1,696,139.55 ns / 590 / 1.00× |
| terms-1024 | 2047 | 1,236,759.71 ns / 809 / 2.79× | 784,730.56 ns / 1,274 / 4.40× | 3,454,856.28 ns / 289 / 1.00× |
| terms-2048 | 4095 | 2,460,044.69 ns / 406 / 3.15× | 1,672,428.23 ns / 598 / 4.64× | 7,754,719.69 ns / 129 / 1.00× |
| terms-4096 | 8191 | 4,935,882.53 ns / 203 / 3.06× | 3,502,386.06 ns / 286 / 4.31× | 15,101,972.88 ns / 66 / 1.00× |
| terms-8192 | 16383 | 10,211,254.25 ns / 98 / 3.22× | 9,071,650.94 ns / 110 / 3.63× | 32,898,798.25 ns / 30 / 1.00× |
| terms-16384 | 32767 | 19,473,359.00 ns / 51 / 3.51× | 15,951,610.00 ns / 63 / 4.29× | 68,377,534.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 12,406.07 ns / 80,606 / 6.01× | 8,736.29 ns / 114,465 / 8.53× | 74,526.29 ns / 13,418 / 1.00× |
| chars-128 | 128 | 79,334.85 ns / 12,605 / 3.74× | 52,236.38 ns / 19,144 / 5.68× | 296,439.28 ns / 3,373 / 1.00× |
| chars-1024 | 1024 | 605,567.48 ns / 1,651 / 3.47× | 413,301.39 ns / 2,420 / 5.09× | 2,101,833.41 ns / 476 / 1.00× |
| chars-2048 | 2048 | 1,149,228.82 ns / 870 / 3.72× | 865,734.65 ns / 1,155 / 4.93× | 4,271,439.00 ns / 234 / 1.00× |
| chars-4096 | 4096 | 2,416,050.33 ns / 414 / 3.93× | 2,156,148.27 ns / 464 / 4.40× | 9,488,837.38 ns / 105 / 1.00× |
| chars-8192 | 8192 | 4,679,802.56 ns / 214 / 4.96× | 5,028,493.94 ns / 199 / 4.61× | 23,195,094.13 ns / 43 / 1.00× |
| chars-16384 | 16384 | 9,370,871.88 ns / 107 / 5.60× | 8,892,545.63 ns / 112 / 5.90× | 52,466,289.50 ns / 19 / 1.00× |
| chars-32768 | 32768 | 19,117,637.25 ns / 52 / 5.54× | 17,695,542.75 ns / 57 / 5.99× | 105,980,377.00 ns / 9 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
