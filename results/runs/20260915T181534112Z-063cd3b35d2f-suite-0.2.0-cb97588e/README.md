# Tabnas measurement — 20260915T181534112Z-063cd3b35d2f-suite-0.2.0-cb97588e

Generated 2026-09-15T18:15:34.112Z from suite `0.2.0` at commit `cb97588ef6e921f1dffe4bc47142c5e0f77fe85f`.

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
| terms-8 | 15 | 11,231.94 ns / 89,032 / 2.47× | 7,217.72 ns / 138,548 / 3.85× | 27,791.93 ns / 35,982 / 1.00× |
| terms-64 | 127 | 74,010.73 ns / 13,512 / 2.88× | 46,519.11 ns / 21,497 / 4.58× | 212,879.70 ns / 4,697 / 1.00× |
| terms-512 | 1023 | 577,133.82 ns / 1,733 / 2.79× | 357,685.17 ns / 2,796 / 4.51× | 1,612,696.59 ns / 620 / 1.00× |
| terms-1024 | 2047 | 1,191,618.19 ns / 839 / 2.73× | 725,796.41 ns / 1,378 / 4.48× | 3,249,097.00 ns / 308 / 1.00× |
| terms-2048 | 4095 | 2,344,742.14 ns / 426 / 2.93× | 1,658,778.95 ns / 603 / 4.14× | 6,865,586.38 ns / 146 / 1.00× |
| terms-4096 | 8191 | 4,724,368.72 ns / 212 / 2.91× | 3,195,409.03 ns / 313 / 4.30× | 13,723,126.88 ns / 73 / 1.00× |
| terms-8192 | 16383 | 9,075,101.31 ns / 110 / 3.20× | 8,274,096.88 ns / 121 / 3.51× | 29,028,888.50 ns / 34 / 1.00× |
| terms-16384 | 32767 | 18,195,895.50 ns / 55 / 3.44× | 15,506,784.88 ns / 64 / 4.04× | 62,612,482.00 ns / 16 / 1.00× |

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
| chars-16 | 16 | 11,899.00 ns / 84,041 / 3.08× | 9,134.37 ns / 109,477 / 4.01× | 36,649.49 ns / 27,286 / 1.00× |
| chars-128 | 128 | 75,371.93 ns / 13,268 / 3.46× | 51,434.10 ns / 19,442 / 5.07× | 260,820.53 ns / 3,834 / 1.00× |
| chars-1024 | 1024 | 588,334.57 ns / 1,700 / 3.28× | 418,874.34 ns / 2,387 / 4.61× | 1,929,817.45 ns / 518 / 1.00× |
| chars-2048 | 2048 | 1,113,314.13 ns / 898 / 3.51× | 828,813.70 ns / 1,207 / 4.72× | 3,908,475.47 ns / 256 / 1.00× |
| chars-4096 | 4096 | 2,270,273.63 ns / 440 / 3.67× | 2,201,254.56 ns / 454 / 3.78× | 8,324,553.38 ns / 120 / 1.00× |
| chars-8192 | 8192 | 4,694,092.78 ns / 213 / 3.78× | 4,687,713.38 ns / 213 / 3.79× | 17,761,475.38 ns / 56 / 1.00× |
| chars-16384 | 16384 | 9,440,360.44 ns / 106 / 4.71× | 8,402,902.13 ns / 119 / 5.29× | 44,449,953.75 ns / 22 / 1.00× |
| chars-32768 | 32768 | 18,982,313.25 ns / 53 / 4.92× | 16,155,227.75 ns / 62 / 5.78× | 93,319,465.50 ns / 11 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
