# Tabnas measurement — 20260915T170129860Z-063cd3b35d2f-suite-0.2.0-5fa7ea55

Generated 2026-09-15T17:01:29.860Z from suite `0.2.0` at commit `5fa7ea55c48bfb2988b4b7ff356f92cb4a0fcd97`.

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
| terms-8 | 15 | 11,378.92 ns / 87,882 / 5.19× | 7,887.66 ns / 126,780 / 7.49× | 59,053.56 ns / 16,934 / 1.00× |
| terms-64 | 127 | 86,812.82 ns / 11,519 / 2.97× | 50,301.34 ns / 19,880 / 5.13× | 257,930.24 ns / 3,877 / 1.00× |
| terms-512 | 1023 | 659,567.33 ns / 1,516 / 2.56× | 398,454.07 ns / 2,510 / 4.24× | 1,688,426.88 ns / 592 / 1.00× |
| terms-1024 | 2047 | 1,387,524.09 ns / 721 / 2.43× | 741,187.49 ns / 1,349 / 4.55× | 3,374,071.88 ns / 296 / 1.00× |
| terms-2048 | 4095 | 2,417,191.14 ns / 414 / 2.93× | 1,604,552.27 ns / 623 / 4.42× | 7,089,091.06 ns / 141 / 1.00× |
| terms-4096 | 8191 | 4,907,911.41 ns / 204 / 2.98× | 3,236,598.50 ns / 309 / 4.51× | 14,604,815.88 ns / 68 / 1.00× |
| terms-8192 | 16383 | 9,424,718.06 ns / 106 / 3.52× | 8,203,561.25 ns / 122 / 4.04× | 33,155,975.50 ns / 30 / 1.00× |
| terms-16384 | 32767 | 18,725,328.63 ns / 53 / 3.64× | 15,486,037.75 ns / 65 / 4.40× | 68,159,494.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 12,324.34 ns / 81,140 / 5.99× | 8,518.59 ns / 117,390 / 8.67× | 73,852.61 ns / 13,540 / 1.00× |
| chars-128 | 128 | 79,099.69 ns / 12,642 / 3.72× | 60,984.46 ns / 16,398 / 4.83× | 294,544.75 ns / 3,395 / 1.00× |
| chars-1024 | 1024 | 627,843.71 ns / 1,593 / 3.24× | 489,631.77 ns / 2,042 / 4.16× | 2,035,128.03 ns / 491 / 1.00× |
| chars-2048 | 2048 | 1,165,453.39 ns / 858 / 3.58× | 977,581.30 ns / 1,023 / 4.27× | 4,175,693.97 ns / 239 / 1.00× |
| chars-4096 | 4096 | 2,326,634.94 ns / 430 / 4.47× | 2,521,917.13 ns / 397 / 4.12× | 10,398,605.94 ns / 96 / 1.00× |
| chars-8192 | 8192 | 4,783,185.56 ns / 209 / 4.88× | 5,443,238.44 ns / 184 / 4.29× | 23,342,307.00 ns / 43 / 1.00× |
| chars-16384 | 16384 | 9,685,810.19 ns / 103 / 5.17× | 9,927,462.75 ns / 101 / 5.04× | 50,070,560.00 ns / 20 / 1.00× |
| chars-32768 | 32768 | 20,416,761.63 ns / 49 / 5.18× | 18,301,616.88 ns / 55 / 5.78× | 105,735,886.00 ns / 9 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
