# Tabnas measurement — 20260915T214136037Z-063cd3b35d2f-suite-0.2.0-11c6bfe9

Generated 2026-09-15T21:41:36.037Z from suite `0.2.0` at commit `11c6bfe917122f9a9906c53deb2aeb51b75e4284`.

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
| terms-8 | 15 | 10,887.00 ns / 91,853 / 1.48× | 7,344.45 ns / 136,157 / 2.19× | 16,096.23 ns / 62,126 / 1.00× |
| terms-64 | 127 | 73,052.63 ns / 13,689 / 1.58× | 44,187.12 ns / 22,631 / 2.62× | 115,660.44 ns / 8,646 / 1.00× |
| terms-512 | 1023 | 594,015.91 ns / 1,683 / 1.59× | 348,511.22 ns / 2,869 / 2.70× | 942,326.63 ns / 1,061 / 1.00× |
| terms-1024 | 2047 | 1,179,548.57 ns / 848 / 1.63× | 711,102.77 ns / 1,406 / 2.70× | 1,918,208.05 ns / 521 / 1.00× |
| terms-2048 | 4095 | 2,579,388.38 ns / 388 / 1.49× | 1,556,881.11 ns / 642 / 2.47× | 3,842,538.94 ns / 260 / 1.00× |
| terms-4096 | 8191 | 5,225,787.59 ns / 191 / 1.50× | 3,269,251.41 ns / 306 / 2.39× | 7,823,739.50 ns / 128 / 1.00× |
| terms-8192 | 16383 | 12,813,957.88 ns / 78 / 1.29× | 7,886,606.56 ns / 127 / 2.09× | 16,467,087.00 ns / 61 / 1.00× |
| terms-16384 | 32767 | 38,231,452.25 ns / 26 / 1.00× | 15,165,643.63 ns / 66 / 2.52× | 33,508,943.50 ns / 30 / 1.14× |

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
| chars-16 | 16 | 12,190.63 ns / 82,030 / 1.72× | 8,268.18 ns / 120,946 / 2.54× | 21,001.61 ns / 47,615 / 1.00× |
| chars-128 | 128 | 74,228.82 ns / 13,472 / 1.91× | 49,817.55 ns / 20,073 / 2.84× | 141,585.67 ns / 7,063 / 1.00× |
| chars-1024 | 1024 | 628,030.46 ns / 1,592 / 1.88× | 402,189.22 ns / 2,486 / 2.93× | 1,178,515.66 ns / 849 / 1.00× |
| chars-2048 | 2048 | 1,154,953.41 ns / 866 / 2.10× | 805,195.13 ns / 1,242 / 3.01× | 2,423,013.97 ns / 413 / 1.00× |
| chars-4096 | 4096 | 2,376,759.97 ns / 421 / 2.05× | 2,150,076.39 ns / 465 / 2.27× | 4,879,805.09 ns / 205 / 1.00× |
| chars-8192 | 8192 | 4,990,759.22 ns / 200 / 2.08× | 4,752,938.75 ns / 210 / 2.19× | 10,395,498.50 ns / 96 / 1.00× |
| chars-16384 | 16384 | 11,385,579.75 ns / 88 / 1.99× | 8,706,746.38 ns / 115 / 2.60× | 22,641,017.75 ns / 44 / 1.00× |
| chars-32768 | 32768 | 33,216,621.25 ns / 30 / 1.38× | 15,373,077.50 ns / 65 / 2.98× | 45,817,273.50 ns / 22 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
