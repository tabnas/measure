# Tabnas measurement — 20260915T181717939Z-063cd3b35d2f-suite-0.2.0-e7f5cea4

Generated 2026-09-15T18:17:17.939Z from suite `0.2.0` at commit `e7f5cea461c629854a300c6f4b26d74d0f57b97e`.

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
| terms-8 | 15 | 10,595.34 ns / 94,381 / 2.77× | 7,052.03 ns / 141,803 / 4.17× | 29,372.55 ns / 34,045 / 1.00× |
| terms-64 | 127 | 70,946.21 ns / 14,095 / 3.00× | 48,452.15 ns / 20,639 / 4.39× | 212,716.84 ns / 4,701 / 1.00× |
| terms-512 | 1023 | 573,834.43 ns / 1,743 / 2.89× | 372,690.19 ns / 2,683 / 4.45× | 1,659,749.08 ns / 603 / 1.00× |
| terms-1024 | 2047 | 1,142,658.84 ns / 875 / 2.97× | 720,624.02 ns / 1,388 / 4.72× | 3,398,046.38 ns / 294 / 1.00× |
| terms-2048 | 4095 | 2,325,558.95 ns / 430 / 2.97× | 1,654,990.70 ns / 604 / 4.18× | 6,916,719.31 ns / 145 / 1.00× |
| terms-4096 | 8191 | 4,660,036.47 ns / 215 / 3.08× | 3,292,585.81 ns / 304 / 4.37× | 14,373,705.50 ns / 70 / 1.00× |
| terms-8192 | 16383 | 9,584,783.19 ns / 104 / 3.23× | 8,027,758.88 ns / 125 / 3.86× | 30,982,146.75 ns / 32 / 1.00× |
| terms-16384 | 32767 | 17,957,629.50 ns / 56 / 3.61× | 15,302,551.88 ns / 65 / 4.24× | 64,803,917.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 11,964.33 ns / 83,582 / 3.16× | 8,485.84 ns / 117,843 / 4.45× | 37,791.52 ns / 26,461 / 1.00× |
| chars-128 | 128 | 75,953.60 ns / 13,166 / 3.45× | 51,658.12 ns / 19,358 / 5.07× | 261,708.98 ns / 3,821 / 1.00× |
| chars-1024 | 1024 | 591,919.14 ns / 1,689 / 3.32× | 424,567.64 ns / 2,355 / 4.63× | 1,965,434.63 ns / 509 / 1.00× |
| chars-2048 | 2048 | 1,111,845.35 ns / 899 / 3.59× | 904,990.62 ns / 1,105 / 4.40× | 3,985,436.84 ns / 251 / 1.00× |
| chars-4096 | 4096 | 2,318,409.88 ns / 431 / 3.72× | 2,442,253.83 ns / 409 / 3.53× | 8,613,298.94 ns / 116 / 1.00× |
| chars-8192 | 8192 | 4,525,888.66 ns / 221 / 4.15× | 5,281,899.28 ns / 189 / 3.56× | 18,787,655.63 ns / 53 / 1.00× |
| chars-16384 | 16384 | 9,227,099.19 ns / 108 / 5.03× | 9,981,302.06 ns / 100 / 4.65× | 46,446,353.00 ns / 22 / 1.00× |
| chars-32768 | 32768 | 19,082,082.25 ns / 52 / 5.18× | 17,813,524.88 ns / 56 / 5.54× | 98,757,350.50 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
