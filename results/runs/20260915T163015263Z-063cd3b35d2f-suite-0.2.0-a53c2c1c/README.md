# Tabnas measurement — 20260915T163015263Z-063cd3b35d2f-suite-0.2.0-a53c2c1c

Generated 2026-09-15T16:30:15.263Z from suite `0.2.0` at commit `a53c2c1c365ea046c03bbddcf5e93e0f9103ca21`.

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
| terms-8 | 15 | 11,837.97 ns / 84,474 / 5.30× | 7,310.52 ns / 136,789 / 8.58× | 62,752.66 ns / 15,936 / 1.00× |
| terms-64 | 127 | 86,540.65 ns / 11,555 / 3.02× | 49,130.52 ns / 20,354 / 5.32× | 261,517.88 ns / 3,824 / 1.00× |
| terms-512 | 1023 | 600,560.59 ns / 1,665 / 3.07× | 411,495.99 ns / 2,430 / 4.48× | 1,844,343.58 ns / 542 / 1.00× |
| terms-1024 | 2047 | 1,225,495.76 ns / 816 / 3.18× | 766,647.86 ns / 1,304 / 5.08× | 3,897,399.25 ns / 257 / 1.00× |
| terms-2048 | 4095 | 2,399,519.28 ns / 417 / 3.45× | 1,757,433.53 ns / 569 / 4.72× | 8,286,830.19 ns / 121 / 1.00× |
| terms-4096 | 8191 | 4,998,411.81 ns / 200 / 3.52× | 3,398,313.16 ns / 294 / 5.17× | 17,568,128.13 ns / 57 / 1.00× |
| terms-8192 | 16383 | 10,598,411.00 ns / 94 / 3.55× | 8,289,787.81 ns / 121 / 4.53× | 37,566,413.50 ns / 27 / 1.00× |
| terms-16384 | 32767 | 18,470,464.75 ns / 54 / 4.02× | 16,464,596.88 ns / 61 / 4.51× | 74,222,700.50 ns / 13 / 1.00× |

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
| chars-16 | 16 | 12,738.79 ns / 78,500 / 6.20× | 8,690.64 ns / 115,066 / 9.09× | 78,979.17 ns / 12,662 / 1.00× |
| chars-128 | 128 | 77,547.45 ns / 12,895 / 4.16× | 51,290.64 ns / 19,497 / 6.29× | 322,503.69 ns / 3,101 / 1.00× |
| chars-1024 | 1024 | 592,698.64 ns / 1,687 / 3.70× | 413,073.75 ns / 2,421 / 5.31× | 2,191,454.81 ns / 456 / 1.00× |
| chars-2048 | 2048 | 1,133,597.69 ns / 882 / 4.00× | 859,836.26 ns / 1,163 / 5.28× | 4,538,521.72 ns / 220 / 1.00× |
| chars-4096 | 4096 | 2,269,673.64 ns / 441 / 4.28× | 2,205,942.97 ns / 453 / 4.40× | 9,715,598.69 ns / 103 / 1.00× |
| chars-8192 | 8192 | 4,661,611.56 ns / 215 / 4.88× | 5,341,475.41 ns / 187 / 4.26× | 22,762,751.13 ns / 44 / 1.00× |
| chars-16384 | 16384 | 9,415,926.81 ns / 106 / 5.37× | 9,462,080.19 ns / 106 / 5.35× | 50,600,912.50 ns / 20 / 1.00× |
| chars-32768 | 32768 | 19,234,389.00 ns / 52 / 5.33× | 18,461,921.25 ns / 54 / 5.55× | 102,540,183.00 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
