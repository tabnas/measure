# Tabnas measurement — 20260915T232005591Z-063cd3b35d2f-suite-0.2.0-47cdeba0

Generated 2026-09-15T23:20:05.591Z from suite `0.2.0` at commit `47cdeba08d0e939122431bd43473da745ff1eeb6`.

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
| terms-8 | 15 | 10,370.53 ns / 96,427 / 1.56× | 7,458.14 ns / 134,082 / 2.17× | 16,183.72 ns / 61,791 / 1.00× |
| terms-64 | 127 | 71,236.86 ns / 14,038 / 1.67× | 46,549.99 ns / 21,482 / 2.56× | 119,180.83 ns / 8,391 / 1.00× |
| terms-512 | 1023 | 581,692.79 ns / 1,719 / 1.60× | 365,227.13 ns / 2,738 / 2.55× | 930,658.34 ns / 1,075 / 1.00× |
| terms-1024 | 2047 | 1,126,576.95 ns / 888 / 1.69× | 699,830.74 ns / 1,429 / 2.71× | 1,899,596.25 ns / 526 / 1.00× |
| terms-2048 | 4095 | 2,370,550.75 ns / 422 / 1.62× | 1,612,238.59 ns / 620 / 2.38× | 3,828,543.91 ns / 261 / 1.00× |
| terms-4096 | 8191 | 6,270,835.50 ns / 159 / 1.23× | 3,233,340.91 ns / 309 / 2.39× | 7,728,403.56 ns / 129 / 1.00× |
| terms-8192 | 16383 | 14,835,875.00 ns / 67 / 1.07× | 8,168,947.88 ns / 122 / 1.95× | 15,888,540.88 ns / 63 / 1.00× |
| terms-16384 | 32767 | 36,247,704.00 ns / 28 / 1.00× | 15,846,372.38 ns / 63 / 2.29× | 33,522,568.50 ns / 30 / 1.08× |

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
| chars-16 | 16 | 11,262.79 ns / 88,788 / 1.87× | 9,081.47 ns / 110,114 / 2.32× | 21,074.02 ns / 47,452 / 1.00× |
| chars-128 | 128 | 72,301.97 ns / 13,831 / 1.95× | 54,504.65 ns / 18,347 / 2.58× | 140,593.12 ns / 7,113 / 1.00× |
| chars-1024 | 1024 | 574,064.63 ns / 1,742 / 2.02× | 449,685.03 ns / 2,224 / 2.58× | 1,162,107.08 ns / 861 / 1.00× |
| chars-2048 | 2048 | 1,174,750.89 ns / 851 / 2.02× | 909,201.27 ns / 1,100 / 2.61× | 2,369,186.41 ns / 422 / 1.00× |
| chars-4096 | 4096 | 2,288,415.56 ns / 437 / 2.09× | 2,075,770.36 ns / 482 / 2.30× | 4,780,721.53 ns / 209 / 1.00× |
| chars-8192 | 8192 | 4,693,076.34 ns / 213 / 2.20× | 4,586,747.22 ns / 218 / 2.25× | 10,338,191.94 ns / 97 / 1.00× |
| chars-16384 | 16384 | 11,380,422.38 ns / 88 / 2.13× | 8,027,716.75 ns / 125 / 3.02× | 24,253,231.00 ns / 41 / 1.00× |
| chars-32768 | 32768 | 33,161,223.50 ns / 30 / 1.50× | 14,809,125.50 ns / 68 / 3.36× | 49,704,901.50 ns / 20 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
