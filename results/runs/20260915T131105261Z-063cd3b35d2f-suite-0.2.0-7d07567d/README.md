# Tabnas measurement — 20260915T131105261Z-063cd3b35d2f-suite-0.2.0-7d07567d

Generated 2026-09-15T13:11:05.261Z from suite `0.2.0` at commit `7d07567d18da05779c6367dfd746a13c77dbb9b8`.

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
| terms-8 | 15 | 10,816.82 ns / 92,449 / 11.09× | 7,771.97 ns / 128,667 / 15.44× | 119,974.41 ns / 8,335 / 1.00× |
| terms-64 | 127 | 73,160.77 ns / 13,669 / 9.33× | 51,530.70 ns / 19,406 / 13.25× | 682,643.52 ns / 1,465 / 1.00× |
| terms-512 | 1023 | 591,182.70 ns / 1,692 / 8.91× | 397,635.62 ns / 2,515 / 13.24× | 5,266,054.56 ns / 190 / 1.00× |
| terms-1024 | 2047 | 1,187,531.46 ns / 842 / 9.52× | 801,033.98 ns / 1,248 / 14.12× | 11,306,373.19 ns / 88 / 1.00× |
| terms-2048 | 4095 | 2,417,135.80 ns / 414 / 10.11× | 1,722,706.47 ns / 580 / 14.19× | 24,441,460.50 ns / 41 / 1.00× |
| terms-4096 | 8191 | 5,039,365.16 ns / 198 / 9.64× | 3,518,498.63 ns / 284 / 13.80× | 48,566,364.50 ns / 21 / 1.00× |
| terms-8192 | 16383 | 12,848,824.94 ns / 78 / 7.71× | 8,690,387.38 ns / 115 / 11.40× | 99,036,536.00 ns / 10 / 1.00× |
| terms-16384 | 32767 | 37,547,090.25 ns / 27 / 5.21× | 16,213,295.88 ns / 62 / 12.06× | 195,485,296.00 ns / 5 / 1.00× |

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
| chars-16 | 16 | 11,902.06 ns / 84,019 / 17.18× | 9,343.83 ns / 107,022 / 21.89× | 204,501.64 ns / 4,890 / 1.00× |
| chars-128 | 128 | 73,704.62 ns / 13,568 / 16.14× | 58,068.88 ns / 17,221 / 20.48× | 1,189,246.95 ns / 841 / 1.00× |
| chars-1024 | 1024 | 623,548.31 ns / 1,604 / 16.15× | 445,594.30 ns / 2,244 / 22.60× | 10,070,740.94 ns / 99 / 1.00× |
| chars-2048 | 2048 | 1,245,478.31 ns / 803 / 18.38× | 1,004,803.58 ns / 995 / 22.78× | 22,891,395.88 ns / 44 / 1.00× |
| chars-4096 | 4096 | 2,423,854.77 ns / 413 / 20.39× | 2,206,672.23 ns / 453 / 22.39× | 49,413,441.00 ns / 20 / 1.00× |
| chars-8192 | 8192 | 4,757,534.91 ns / 210 / 21.52× | 4,784,783.84 ns / 209 / 21.39× | 102,360,821.50 ns / 10 / 1.00× |
| chars-16384 | 16384 | 10,988,275.31 ns / 91 / 18.99× | 8,971,664.44 ns / 111 / 23.25× | 208,619,965.00 ns / 5 / 1.00× |
| chars-32768 | 32768 | 32,684,151.25 ns / 31 / 12.55× | 17,303,120.63 ns / 58 / 23.71× | 410,191,145.00 ns / 2 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
