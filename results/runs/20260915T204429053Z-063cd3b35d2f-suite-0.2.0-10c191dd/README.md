# Tabnas measurement — 20260915T204429053Z-063cd3b35d2f-suite-0.2.0-10c191dd

Generated 2026-09-15T20:44:29.053Z from suite `0.2.0` at commit `10c191dd4e301d93bcc5354224a28523090c169c`.

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
| terms-8 | 15 | 10,463.99 ns / 95,566 / 1.72× | 7,249.12 ns / 137,948 / 2.49× | 18,030.89 ns / 55,460 / 1.00× |
| terms-64 | 127 | 73,640.87 ns / 13,579 / 1.79× | 48,114.84 ns / 20,784 / 2.75× | 132,126.44 ns / 7,569 / 1.00× |
| terms-512 | 1023 | 589,091.07 ns / 1,698 / 1.77× | 377,502.43 ns / 2,649 / 2.76× | 1,042,329.80 ns / 959 / 1.00× |
| terms-1024 | 2047 | 1,154,004.97 ns / 867 / 1.83× | 724,631.73 ns / 1,380 / 2.91× | 2,108,251.59 ns / 474 / 1.00× |
| terms-2048 | 4095 | 2,413,442.36 ns / 414 / 1.78× | 1,642,494.13 ns / 609 / 2.62× | 4,305,633.31 ns / 232 / 1.00× |
| terms-4096 | 8191 | 5,326,767.84 ns / 188 / 1.62× | 3,177,164.31 ns / 315 / 2.72× | 8,651,979.94 ns / 116 / 1.00× |
| terms-8192 | 16383 | 12,612,899.88 ns / 79 / 1.46× | 8,130,873.00 ns / 123 / 2.27× | 18,439,580.25 ns / 54 / 1.00× |
| terms-16384 | 32767 | 36,344,282.00 ns / 28 / 1.03× | 16,194,881.75 ns / 62 / 2.32× | 37,576,770.75 ns / 27 / 1.00× |

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
| chars-16 | 16 | 11,631.80 ns / 85,971 / 1.99× | 9,097.56 ns / 109,920 / 2.55× | 23,196.31 ns / 43,110 / 1.00× |
| chars-128 | 128 | 73,324.73 ns / 13,638 / 2.11× | 51,679.57 ns / 19,350 / 3.00× | 154,845.94 ns / 6,458 / 1.00× |
| chars-1024 | 1024 | 604,943.74 ns / 1,653 / 2.08× | 419,938.76 ns / 2,381 / 3.00× | 1,258,424.68 ns / 795 / 1.00× |
| chars-2048 | 2048 | 1,207,758.41 ns / 828 / 2.11× | 839,440.41 ns / 1,191 / 3.04× | 2,548,183.23 ns / 392 / 1.00× |
| chars-4096 | 4096 | 2,261,819.97 ns / 442 / 2.32× | 2,335,018.23 ns / 428 / 2.25× | 5,244,948.38 ns / 191 / 1.00× |
| chars-8192 | 8192 | 4,722,533.09 ns / 212 / 2.55× | 5,258,954.16 ns / 190 / 2.29× | 12,056,768.13 ns / 83 / 1.00× |
| chars-16384 | 16384 | 10,598,342.00 ns / 94 / 2.59× | 9,792,495.63 ns / 102 / 2.80× | 27,454,141.25 ns / 36 / 1.00× |
| chars-32768 | 32768 | 31,725,352.25 ns / 32 / 1.73× | 16,889,265.75 ns / 59 / 3.24× | 54,766,738.00 ns / 18 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
