# Tabnas measurement — 20260915T220509899Z-063cd3b35d2f-suite-0.2.0-735ebc91

Generated 2026-09-15T22:05:09.899Z from suite `0.2.0` at commit `735ebc9124d9efae8abb91b918a82f31af8e2cda`.

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
| terms-8 | 15 | 10,273.74 ns / 97,335 / 1.60× | 6,976.89 ns / 143,330 / 2.35× | 16,405.95 ns / 60,954 / 1.00× |
| terms-64 | 127 | 71,514.80 ns / 13,983 / 1.64× | 44,220.95 ns / 22,614 / 2.65× | 117,229.62 ns / 8,530 / 1.00× |
| terms-512 | 1023 | 575,932.87 ns / 1,736 / 1.63× | 348,712.46 ns / 2,868 / 2.70× | 940,961.36 ns / 1,063 / 1.00× |
| terms-1024 | 2047 | 1,147,991.76 ns / 871 / 1.66× | 762,616.79 ns / 1,311 / 2.50× | 1,902,988.02 ns / 525 / 1.00× |
| terms-2048 | 4095 | 2,396,967.08 ns / 417 / 1.60× | 1,673,843.38 ns / 597 / 2.29× | 3,823,920.47 ns / 262 / 1.00× |
| terms-4096 | 8191 | 4,970,835.69 ns / 201 / 1.58× | 3,346,217.28 ns / 299 / 2.35× | 7,859,539.81 ns / 127 / 1.00× |
| terms-8192 | 16383 | 12,868,562.31 ns / 78 / 1.24× | 8,600,621.13 ns / 116 / 1.86× | 15,987,619.13 ns / 63 / 1.00× |
| terms-16384 | 32767 | 36,294,031.00 ns / 28 / 1.00× | 16,171,418.63 ns / 62 / 2.24× | 32,889,072.25 ns / 30 / 1.10× |

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
| chars-16 | 16 | 11,579.95 ns / 86,356 / 1.87× | 9,445.63 ns / 105,869 / 2.30× | 21,695.66 ns / 46,092 / 1.00× |
| chars-128 | 128 | 72,321.10 ns / 13,827 / 1.99× | 55,835.31 ns / 17,910 / 2.57× | 143,705.21 ns / 6,959 / 1.00× |
| chars-1024 | 1024 | 590,741.51 ns / 1,693 / 2.05× | 459,799.78 ns / 2,175 / 2.64× | 1,212,392.10 ns / 825 / 1.00× |
| chars-2048 | 2048 | 1,111,276.47 ns / 900 / 2.17× | 940,877.55 ns / 1,063 / 2.56× | 2,410,367.72 ns / 415 / 1.00× |
| chars-4096 | 4096 | 2,259,908.13 ns / 442 / 2.16× | 2,287,296.95 ns / 437 / 2.13× | 4,880,713.66 ns / 205 / 1.00× |
| chars-8192 | 8192 | 4,823,513.16 ns / 207 / 2.13× | 4,518,756.75 ns / 221 / 2.27× | 10,260,461.94 ns / 97 / 1.00× |
| chars-16384 | 16384 | 10,710,027.31 ns / 93 / 2.06× | 8,411,727.94 ns / 119 / 2.62× | 22,020,173.13 ns / 45 / 1.00× |
| chars-32768 | 32768 | 32,717,080.50 ns / 31 / 1.44× | 14,778,597.25 ns / 68 / 3.20× | 47,231,999.00 ns / 21 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
