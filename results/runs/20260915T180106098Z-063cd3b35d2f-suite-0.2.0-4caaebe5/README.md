# Tabnas measurement — 20260915T180106098Z-063cd3b35d2f-suite-0.2.0-4caaebe5

Generated 2026-09-15T18:01:06.098Z from suite `0.2.0` at commit `4caaebe507710878280c5fc4d470a62ffa55885f`.

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
| terms-8 | 15 | 11,326.30 ns / 88,290 / 2.61× | 7,704.42 ns / 129,796 / 3.84× | 29,600.58 ns / 33,783 / 1.00× |
| terms-64 | 127 | 78,523.07 ns / 12,735 / 2.86× | 46,281.89 ns / 21,607 / 4.85× | 224,509.44 ns / 4,454 / 1.00× |
| terms-512 | 1023 | 638,091.46 ns / 1,567 / 2.67× | 373,481.38 ns / 2,678 / 4.56× | 1,703,840.14 ns / 587 / 1.00× |
| terms-1024 | 2047 | 1,213,299.35 ns / 824 / 2.83× | 763,225.42 ns / 1,310 / 4.50× | 3,435,496.63 ns / 291 / 1.00× |
| terms-2048 | 4095 | 2,454,454.39 ns / 407 / 2.92× | 1,758,574.41 ns / 569 / 4.07× | 7,158,882.06 ns / 140 / 1.00× |
| terms-4096 | 8191 | 5,078,605.81 ns / 197 / 2.94× | 3,645,488.16 ns / 274 / 4.10× | 14,946,921.75 ns / 67 / 1.00× |
| terms-8192 | 16383 | 10,043,690.31 ns / 100 / 3.19× | 8,546,913.31 ns / 117 / 3.75× | 32,016,842.25 ns / 31 / 1.00× |
| terms-16384 | 32767 | 18,804,102.00 ns / 53 / 3.57× | 16,566,125.13 ns / 60 / 4.05× | 67,097,841.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 12,123.79 ns / 82,482 / 3.19× | 9,474.04 ns / 105,552 / 4.09× | 38,704.24 ns / 25,837 / 1.00× |
| chars-128 | 128 | 77,046.81 ns / 12,979 / 3.41× | 53,596.01 ns / 18,658 / 4.90× | 262,602.23 ns / 3,808 / 1.00× |
| chars-1024 | 1024 | 615,144.50 ns / 1,626 / 3.26× | 418,599.27 ns / 2,389 / 4.79× | 2,006,212.45 ns / 498 / 1.00× |
| chars-2048 | 2048 | 1,160,040.59 ns / 862 / 3.53× | 855,517.01 ns / 1,169 / 4.79× | 4,099,638.34 ns / 244 / 1.00× |
| chars-4096 | 4096 | 2,307,792.78 ns / 433 / 3.82× | 2,182,118.19 ns / 458 / 4.04× | 8,804,575.81 ns / 114 / 1.00× |
| chars-8192 | 8192 | 4,753,553.78 ns / 210 / 4.25× | 4,875,752.59 ns / 205 / 4.14× | 20,192,993.63 ns / 50 / 1.00× |
| chars-16384 | 16384 | 9,686,864.31 ns / 103 / 4.63× | 8,476,520.13 ns / 118 / 5.29× | 44,877,853.25 ns / 22 / 1.00× |
| chars-32768 | 32768 | 20,116,068.25 ns / 50 / 4.74× | 15,479,947.38 ns / 65 / 6.15× | 95,241,837.50 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
