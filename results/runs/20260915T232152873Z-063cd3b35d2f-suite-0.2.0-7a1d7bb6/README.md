# Tabnas measurement — 20260915T232152873Z-063cd3b35d2f-suite-0.2.0-7a1d7bb6

Generated 2026-09-15T23:21:52.873Z from suite `0.2.0` at commit `7a1d7bb6ac8315db0f2d0f492d17a212b5c8ebd4`.

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
| terms-8 | 15 | 10,893.98 ns / 91,794 / 1.47× | 7,438.36 ns / 134,438 / 2.15× | 16,022.59 ns / 62,412 / 1.00× |
| terms-64 | 127 | 70,158.22 ns / 14,253 / 1.64× | 46,216.31 ns / 21,637 / 2.48× | 114,821.36 ns / 8,709 / 1.00× |
| terms-512 | 1023 | 579,136.80 ns / 1,727 / 1.62× | 363,437.58 ns / 2,752 / 2.59× | 940,135.87 ns / 1,064 / 1.00× |
| terms-1024 | 2047 | 1,158,336.15 ns / 863 / 1.62× | 695,352.02 ns / 1,438 / 2.71× | 1,881,462.59 ns / 532 / 1.00× |
| terms-2048 | 4095 | 2,429,364.53 ns / 412 / 1.56× | 1,570,411.59 ns / 637 / 2.41× | 3,785,700.81 ns / 264 / 1.00× |
| terms-4096 | 8191 | 4,988,734.25 ns / 200 / 1.53× | 3,314,481.47 ns / 302 / 2.30× | 7,630,846.00 ns / 131 / 1.00× |
| terms-8192 | 16383 | 12,545,295.75 ns / 80 / 1.30× | 7,695,677.69 ns / 130 / 2.11× | 16,247,234.00 ns / 62 / 1.00× |
| terms-16384 | 32767 | 36,820,426.50 ns / 27 / 1.00× | 14,938,708.63 ns / 67 / 2.47× | 32,902,622.00 ns / 30 / 1.12× |

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
| chars-16 | 16 | 11,368.54 ns / 87,962 / 1.85× | 8,135.43 ns / 122,919 / 2.59× | 21,072.72 ns / 47,455 / 1.00× |
| chars-128 | 128 | 71,615.23 ns / 13,964 / 1.96× | 49,263.89 ns / 20,299 / 2.84× | 139,980.66 ns / 7,144 / 1.00× |
| chars-1024 | 1024 | 610,948.81 ns / 1,637 / 1.89× | 389,027.80 ns / 2,571 / 2.97× | 1,156,648.60 ns / 865 / 1.00× |
| chars-2048 | 2048 | 1,119,215.90 ns / 893 / 2.12× | 800,836.33 ns / 1,249 / 2.96× | 2,371,117.83 ns / 422 / 1.00× |
| chars-4096 | 4096 | 2,316,276.48 ns / 432 / 2.05× | 2,072,175.53 ns / 483 / 2.29× | 4,744,465.41 ns / 211 / 1.00× |
| chars-8192 | 8192 | 4,808,911.47 ns / 208 / 2.11× | 4,676,894.41 ns / 214 / 2.17× | 10,163,376.81 ns / 98 / 1.00× |
| chars-16384 | 16384 | 11,020,825.13 ns / 91 / 2.03× | 8,129,128.31 ns / 123 / 2.76× | 22,398,239.38 ns / 45 / 1.00× |
| chars-32768 | 32768 | 32,556,926.00 ns / 31 / 1.44× | 15,213,920.88 ns / 66 / 3.07× | 46,721,090.50 ns / 21 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
