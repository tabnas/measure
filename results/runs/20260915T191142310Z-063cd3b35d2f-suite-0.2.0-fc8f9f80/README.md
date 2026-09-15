# Tabnas measurement — 20260915T191142310Z-063cd3b35d2f-suite-0.2.0-fc8f9f80

Generated 2026-09-15T19:11:42.310Z from suite `0.2.0` at commit `fc8f9f804264fa1c1e01e4ee4cfd2307fcb0e420`.

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
| terms-8 | 15 | 11,547.98 ns / 86,595 / 1.79× | 7,397.37 ns / 135,183 / 2.80× | 20,708.79 ns / 48,289 / 1.00× |
| terms-64 | 127 | 76,452.19 ns / 13,080 / 1.96× | 47,558.41 ns / 21,027 / 3.16× | 150,087.54 ns / 6,663 / 1.00× |
| terms-512 | 1023 | 630,442.94 ns / 1,586 / 1.95× | 379,071.37 ns / 2,638 / 3.24× | 1,226,180.78 ns / 816 / 1.00× |
| terms-1024 | 2047 | 1,194,988.97 ns / 837 / 2.13× | 762,717.23 ns / 1,311 / 3.33× | 2,539,831.84 ns / 394 / 1.00× |
| terms-2048 | 4095 | 2,373,674.42 ns / 421 / 2.17× | 1,668,198.53 ns / 599 / 3.09× | 5,158,787.91 ns / 194 / 1.00× |
| terms-4096 | 8191 | 4,772,630.22 ns / 210 / 2.39× | 3,242,588.72 ns / 308 / 3.52× | 11,402,060.00 ns / 88 / 1.00× |
| terms-8192 | 16383 | 9,900,001.06 ns / 101 / 2.28× | 8,629,320.25 ns / 116 / 2.61× | 22,557,019.25 ns / 44 / 1.00× |
| terms-16384 | 32767 | 18,268,949.88 ns / 55 / 2.47× | 16,290,857.88 ns / 61 / 2.76× | 45,028,826.50 ns / 22 / 1.00× |

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
| chars-16 | 16 | 11,912.64 ns / 83,944 / 2.11× | 8,828.68 ns / 113,267 / 2.85× | 25,157.45 ns / 39,750 / 1.00× |
| chars-128 | 128 | 76,785.65 ns / 13,023 / 2.22× | 52,933.38 ns / 18,892 / 3.22× | 170,336.35 ns / 5,871 / 1.00× |
| chars-1024 | 1024 | 588,426.14 ns / 1,699 / 2.39× | 456,202.72 ns / 2,192 / 3.08× | 1,403,526.94 ns / 712 / 1.00× |
| chars-2048 | 2048 | 1,117,092.38 ns / 895 / 2.54× | 950,616.39 ns / 1,052 / 2.99× | 2,839,829.13 ns / 352 / 1.00× |
| chars-4096 | 4096 | 2,333,787.22 ns / 428 / 2.61× | 2,557,136.53 ns / 391 / 2.38× | 6,078,439.16 ns / 165 / 1.00× |
| chars-8192 | 8192 | 4,771,660.91 ns / 210 / 3.01× | 4,897,967.56 ns / 204 / 2.93× | 14,352,900.88 ns / 70 / 1.00× |
| chars-16384 | 16384 | 9,729,501.69 ns / 103 / 3.11× | 9,083,663.00 ns / 110 / 3.34× | 30,299,188.00 ns / 33 / 1.00× |
| chars-32768 | 32768 | 20,048,600.50 ns / 50 / 3.36× | 16,926,090.38 ns / 59 / 3.97× | 67,258,368.50 ns / 15 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
