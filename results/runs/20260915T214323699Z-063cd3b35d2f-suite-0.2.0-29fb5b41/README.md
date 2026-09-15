# Tabnas measurement — 20260915T214323699Z-063cd3b35d2f-suite-0.2.0-29fb5b41

Generated 2026-09-15T21:43:23.699Z from suite `0.2.0` at commit `29fb5b41ba93921a2b25a88ed9397028ed8a9f6b`.

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
| terms-8 | 15 | 10,840.77 ns / 92,244 / 1.49× | 7,483.47 ns / 133,628 / 2.16× | 16,132.16 ns / 61,988 / 1.00× |
| terms-64 | 127 | 76,168.58 ns / 13,129 / 1.52× | 46,150.99 ns / 21,668 / 2.52× | 116,069.54 ns / 8,616 / 1.00× |
| terms-512 | 1023 | 588,722.41 ns / 1,699 / 1.61× | 366,002.94 ns / 2,732 / 2.59× | 947,785.31 ns / 1,055 / 1.00× |
| terms-1024 | 2047 | 1,155,232.09 ns / 866 / 1.65× | 716,118.59 ns / 1,396 / 2.66× | 1,903,527.09 ns / 525 / 1.00× |
| terms-2048 | 4095 | 2,447,079.16 ns / 409 / 1.58× | 1,551,007.42 ns / 645 / 2.49× | 3,862,897.63 ns / 259 / 1.00× |
| terms-4096 | 8191 | 5,218,339.38 ns / 192 / 1.51× | 3,127,238.19 ns / 320 / 2.52× | 7,865,512.75 ns / 127 / 1.00× |
| terms-8192 | 16383 | 13,001,470.63 ns / 77 / 1.31× | 7,798,764.19 ns / 128 / 2.18× | 16,974,749.13 ns / 59 / 1.00× |
| terms-16384 | 32767 | 37,624,898.75 ns / 27 / 1.00× | 14,946,730.25 ns / 67 / 2.52× | 34,007,223.00 ns / 29 / 1.11× |

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
| chars-16 | 16 | 12,237.07 ns / 81,719 / 1.72× | 8,321.41 ns / 120,172 / 2.53× | 21,016.16 ns / 47,582 / 1.00× |
| chars-128 | 128 | 74,265.38 ns / 13,465 / 1.89× | 50,171.81 ns / 19,932 / 2.80× | 140,583.13 ns / 7,113 / 1.00× |
| chars-1024 | 1024 | 608,912.86 ns / 1,642 / 1.92× | 410,328.46 ns / 2,437 / 2.85× | 1,171,110.11 ns / 854 / 1.00× |
| chars-2048 | 2048 | 1,240,078.30 ns / 806 / 1.93× | 834,098.52 ns / 1,199 / 2.86× | 2,387,350.44 ns / 419 / 1.00× |
| chars-4096 | 4096 | 2,326,413.05 ns / 430 / 2.07× | 2,129,260.63 ns / 470 / 2.27× | 4,822,247.44 ns / 207 / 1.00× |
| chars-8192 | 8192 | 4,876,863.22 ns / 205 / 2.12× | 4,780,387.53 ns / 209 / 2.16× | 10,340,924.50 ns / 97 / 1.00× |
| chars-16384 | 16384 | 11,348,281.13 ns / 88 / 1.94× | 8,418,927.69 ns / 119 / 2.62× | 22,017,867.63 ns / 45 / 1.00× |
| chars-32768 | 32768 | 32,213,757.25 ns / 31 / 1.43× | 15,515,718.25 ns / 64 / 2.98× | 46,198,293.75 ns / 22 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
