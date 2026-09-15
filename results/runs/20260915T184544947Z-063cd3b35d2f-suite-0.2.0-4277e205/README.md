# Tabnas measurement — 20260915T184544947Z-063cd3b35d2f-suite-0.2.0-4277e205

Generated 2026-09-15T18:45:44.947Z from suite `0.2.0` at commit `4277e205ba7944a17c4b1e8eab12b863afd42521`.

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
| terms-8 | 15 | 11,539.08 ns / 86,662 / 1.94× | 7,463.07 ns / 133,993 / 3.00× | 22,401.04 ns / 44,641 / 1.00× |
| terms-64 | 127 | 83,384.62 ns / 11,993 / 1.95× | 46,285.93 ns / 21,605 / 3.52× | 162,773.11 ns / 6,144 / 1.00× |
| terms-512 | 1023 | 584,445.79 ns / 1,711 / 2.40× | 366,987.65 ns / 2,725 / 3.82× | 1,402,998.22 ns / 713 / 1.00× |
| terms-1024 | 2047 | 1,188,349.52 ns / 842 / 2.44× | 724,870.41 ns / 1,380 / 4.00× | 2,895,626.86 ns / 345 / 1.00× |
| terms-2048 | 4095 | 2,358,453.17 ns / 424 / 2.55× | 1,674,577.92 ns / 597 / 3.60× | 6,021,080.69 ns / 166 / 1.00× |
| terms-4096 | 8191 | 4,703,434.59 ns / 213 / 2.77× | 3,150,209.88 ns / 317 / 4.14× | 13,048,320.38 ns / 77 / 1.00× |
| terms-8192 | 16383 | 9,928,991.19 ns / 101 / 2.41× | 8,075,189.19 ns / 124 / 2.96× | 23,896,531.50 ns / 42 / 1.00× |
| terms-16384 | 32767 | 18,334,161.13 ns / 55 / 2.66× | 15,458,518.50 ns / 65 / 3.16× | 48,811,411.25 ns / 20 / 1.00× |

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
| chars-16 | 16 | 12,039.57 ns / 83,059 / 2.26× | 8,559.98 ns / 116,823 / 3.17× | 27,156.28 ns / 36,824 / 1.00× |
| chars-128 | 128 | 76,445.03 ns / 13,081 / 2.36× | 52,547.79 ns / 19,030 / 3.43× | 180,147.04 ns / 5,551 / 1.00× |
| chars-1024 | 1024 | 604,763.52 ns / 1,654 / 2.55× | 412,597.03 ns / 2,424 / 3.74× | 1,544,545.28 ns / 647 / 1.00× |
| chars-2048 | 2048 | 1,134,213.54 ns / 882 / 2.78× | 856,398.47 ns / 1,168 / 3.68× | 3,150,202.25 ns / 317 / 1.00× |
| chars-4096 | 4096 | 2,326,590.28 ns / 430 / 2.66× | 2,217,902.19 ns / 451 / 2.79× | 6,186,054.41 ns / 162 / 1.00× |
| chars-8192 | 8192 | 4,616,717.34 ns / 217 / 2.87× | 4,676,398.53 ns / 214 / 2.83× | 13,229,857.50 ns / 76 / 1.00× |
| chars-16384 | 16384 | 9,192,326.00 ns / 109 / 3.13× | 8,358,663.06 ns / 120 / 3.44× | 28,781,074.75 ns / 35 / 1.00× |
| chars-32768 | 32768 | 19,255,420.88 ns / 52 / 3.11× | 15,917,733.63 ns / 63 / 3.76× | 59,801,005.50 ns / 17 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
