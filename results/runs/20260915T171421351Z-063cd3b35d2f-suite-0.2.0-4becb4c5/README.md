# Tabnas measurement — 20260915T171421351Z-063cd3b35d2f-suite-0.2.0-4becb4c5

Generated 2026-09-15T17:14:21.351Z from suite `0.2.0` at commit `4becb4c551758ecc12b7e1b538c59b8cf157416c`.

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
| terms-8 | 15 | 11,691.89 ns / 85,529 / 5.00× | 7,206.95 ns / 138,755 / 8.11× | 58,423.42 ns / 17,116 / 1.00× |
| terms-64 | 127 | 78,398.04 ns / 12,755 / 3.14× | 45,396.87 ns / 22,028 / 5.42× | 245,812.15 ns / 4,068 / 1.00× |
| terms-512 | 1023 | 600,181.59 ns / 1,666 / 2.87× | 368,060.76 ns / 2,717 / 4.67× | 1,719,338.66 ns / 582 / 1.00× |
| terms-1024 | 2047 | 1,214,319.40 ns / 824 / 2.82× | 723,078.32 ns / 1,383 / 4.74× | 3,424,332.75 ns / 292 / 1.00× |
| terms-2048 | 4095 | 2,370,366.59 ns / 422 / 3.01× | 1,600,999.95 ns / 625 / 4.45× | 7,128,476.69 ns / 140 / 1.00× |
| terms-4096 | 8191 | 4,759,281.13 ns / 210 / 3.42× | 3,185,410.70 ns / 314 / 5.11× | 16,262,218.63 ns / 61 / 1.00× |
| terms-8192 | 16383 | 9,693,066.00 ns / 103 / 3.62× | 7,887,789.44 ns / 127 / 4.45× | 35,091,271.00 ns / 28 / 1.00× |
| terms-16384 | 32767 | 17,959,519.88 ns / 56 / 4.11× | 15,844,833.13 ns / 63 / 4.65× | 73,742,017.50 ns / 14 / 1.00× |

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
| chars-16 | 16 | 11,913.44 ns / 83,939 / 6.33× | 9,084.98 ns / 110,072 / 8.30× | 75,361.15 ns / 13,269 / 1.00× |
| chars-128 | 128 | 75,414.81 ns / 13,260 / 4.03× | 57,384.70 ns / 17,426 / 5.30× | 303,849.35 ns / 3,291 / 1.00× |
| chars-1024 | 1024 | 602,284.42 ns / 1,660 / 3.55× | 428,314.73 ns / 2,335 / 4.99× | 2,138,411.38 ns / 468 / 1.00× |
| chars-2048 | 2048 | 1,116,508.94 ns / 896 / 4.33× | 832,936.32 ns / 1,201 / 5.81× | 4,839,334.50 ns / 207 / 1.00× |
| chars-4096 | 4096 | 2,285,574.36 ns / 438 / 4.94× | 2,183,746.67 ns / 458 / 5.18× | 11,300,510.00 ns / 88 / 1.00× |
| chars-8192 | 8192 | 4,628,597.22 ns / 216 / 5.57× | 4,864,014.50 ns / 206 / 5.30× | 25,799,283.00 ns / 39 / 1.00× |
| chars-16384 | 16384 | 9,311,949.50 ns / 107 / 5.79× | 8,720,421.88 ns / 115 / 6.19× | 53,937,587.00 ns / 19 / 1.00× |
| chars-32768 | 32768 | 18,982,111.00 ns / 53 / 5.83× | 16,285,836.50 ns / 61 / 6.80× | 110,740,652.00 ns / 9 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
