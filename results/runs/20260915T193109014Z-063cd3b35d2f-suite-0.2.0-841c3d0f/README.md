# Tabnas measurement — 20260915T193109014Z-063cd3b35d2f-suite-0.2.0-841c3d0f

Generated 2026-09-15T19:31:09.014Z from suite `0.2.0` at commit `841c3d0fbe7d61f549a8990e4e6fede7905b31b3`.

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
| terms-8 | 15 | 10,734.07 ns / 93,161 / 1.89× | 7,831.83 ns / 127,684 / 2.58× | 20,232.53 ns / 49,425 / 1.00× |
| terms-64 | 127 | 74,082.27 ns / 13,499 / 2.00× | 48,362.22 ns / 20,677 / 3.06× | 148,012.68 ns / 6,756 / 1.00× |
| terms-512 | 1023 | 592,276.23 ns / 1,688 / 2.04× | 379,295.89 ns / 2,636 / 3.18× | 1,207,061.98 ns / 828 / 1.00× |
| terms-1024 | 2047 | 1,166,546.05 ns / 857 / 2.10× | 755,253.76 ns / 1,324 / 3.25× | 2,451,107.34 ns / 408 / 1.00× |
| terms-2048 | 4095 | 2,401,961.33 ns / 416 / 2.05× | 1,714,162.75 ns / 583 / 2.88× | 4,929,502.16 ns / 203 / 1.00× |
| terms-4096 | 8191 | 5,268,925.28 ns / 190 / 1.97× | 3,447,639.84 ns / 290 / 3.01× | 10,362,241.56 ns / 97 / 1.00× |
| terms-8192 | 16383 | 12,492,439.38 ns / 80 / 1.70× | 8,262,830.88 ns / 121 / 2.57× | 21,271,380.75 ns / 47 / 1.00× |
| terms-16384 | 32767 | 38,957,422.00 ns / 26 / 1.10× | 15,771,107.25 ns / 63 / 2.72× | 42,879,777.50 ns / 23 / 1.00× |

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
| chars-16 | 16 | 11,972.95 ns / 83,522 / 2.12× | 8,558.73 ns / 116,840 / 2.97× | 25,385.88 ns / 39,392 / 1.00× |
| chars-128 | 128 | 74,597.37 ns / 13,405 / 2.23× | 51,541.26 ns / 19,402 / 3.22× | 166,191.17 ns / 6,017 / 1.00× |
| chars-1024 | 1024 | 572,939.75 ns / 1,745 / 2.41× | 420,332.57 ns / 2,379 / 3.29× | 1,381,595.45 ns / 724 / 1.00× |
| chars-2048 | 2048 | 1,129,625.85 ns / 885 / 2.50× | 968,807.56 ns / 1,032 / 2.91× | 2,820,963.30 ns / 354 / 1.00× |
| chars-4096 | 4096 | 2,317,647.53 ns / 431 / 2.50× | 2,256,801.17 ns / 443 / 2.57× | 5,792,542.47 ns / 173 / 1.00× |
| chars-8192 | 8192 | 4,667,780.03 ns / 214 / 2.67× | 5,190,055.03 ns / 193 / 2.40× | 12,441,495.06 ns / 80 / 1.00× |
| chars-16384 | 16384 | 10,946,417.94 ns / 91 / 2.42× | 8,697,707.94 ns / 115 / 3.05× | 26,496,741.00 ns / 38 / 1.00× |
| chars-32768 | 32768 | 32,661,217.75 ns / 31 / 1.64× | 15,617,080.63 ns / 64 / 3.42× | 53,431,163.50 ns / 19 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
