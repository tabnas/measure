# Tabnas measurement — 20260915T175043944Z-063cd3b35d2f-suite-0.2.0-a2b03ce0

Generated 2026-09-15T17:50:43.944Z from suite `0.2.0` at commit `a2b03ce0620484e5e02ae153581d17baaf109933`.

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
| terms-8 | 15 | 11,501.86 ns / 86,942 / 2.81× | 8,626.88 ns / 115,917 / 3.75× | 32,365.12 ns / 30,897 / 1.00× |
| terms-64 | 127 | 77,718.93 ns / 12,867 / 2.80× | 48,575.95 ns / 20,586 / 4.48× | 217,759.25 ns / 4,592 / 1.00× |
| terms-512 | 1023 | 592,963.48 ns / 1,686 / 2.75× | 386,345.83 ns / 2,588 / 4.22× | 1,628,482.22 ns / 614 / 1.00× |
| terms-1024 | 2047 | 1,210,972.60 ns / 826 / 2.74× | 756,447.20 ns / 1,322 / 4.39× | 3,320,377.59 ns / 301 / 1.00× |
| terms-2048 | 4095 | 2,402,498.16 ns / 416 / 2.89× | 1,683,305.64 ns / 594 / 4.13× | 6,945,699.81 ns / 144 / 1.00× |
| terms-4096 | 8191 | 5,119,914.03 ns / 195 / 2.95× | 3,382,218.81 ns / 296 / 4.47× | 15,123,288.38 ns / 66 / 1.00× |
| terms-8192 | 16383 | 9,941,596.81 ns / 101 / 3.31× | 8,238,046.81 ns / 121 / 3.99× | 32,903,458.50 ns / 30 / 1.00× |
| terms-16384 | 32767 | 18,364,692.75 ns / 54 / 3.56× | 16,363,686.75 ns / 61 / 4.00× | 65,369,735.00 ns / 15 / 1.00× |

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
| chars-16 | 16 | 12,206.39 ns / 81,924 / 3.56× | 9,308.93 ns / 107,424 / 4.66× | 43,411.66 ns / 23,035 / 1.00× |
| chars-128 | 128 | 76,246.57 ns / 13,115 / 3.66× | 51,534.49 ns / 19,404 / 5.41× | 278,685.94 ns / 3,588 / 1.00× |
| chars-1024 | 1024 | 607,598.18 ns / 1,646 / 3.36× | 438,160.33 ns / 2,282 / 4.66× | 2,040,128.39 ns / 490 / 1.00× |
| chars-2048 | 2048 | 1,143,796.66 ns / 874 / 3.59× | 946,748.63 ns / 1,056 / 4.33× | 4,102,874.63 ns / 244 / 1.00× |
| chars-4096 | 4096 | 2,348,373.98 ns / 426 / 3.74× | 2,451,319.38 ns / 408 / 3.59× | 8,787,031.38 ns / 114 / 1.00× |
| chars-8192 | 8192 | 4,796,385.75 ns / 208 / 4.02× | 5,207,247.34 ns / 192 / 3.70× | 19,273,155.50 ns / 52 / 1.00× |
| chars-16384 | 16384 | 9,145,727.75 ns / 109 / 4.77× | 9,623,604.75 ns / 104 / 4.53× | 43,591,120.25 ns / 23 / 1.00× |
| chars-32768 | 32768 | 21,394,762.25 ns / 47 / 4.46× | 17,540,599.88 ns / 57 / 5.44× | 95,411,775.00 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
