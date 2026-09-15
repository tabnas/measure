# Tabnas measurement — 20260915T132308094Z-063cd3b35d2f-suite-0.2.0-0efa10a7

Generated 2026-09-15T13:23:08.094Z from suite `0.2.0` at commit `0efa10a7dd2c657a185610c5b35787c353623ec6`.

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
| terms-8 | 15 | 11,429.35 ns / 87,494 / 10.09× | 7,827.29 ns / 127,758 / 14.74× | 115,360.79 ns / 8,668 / 1.00× |
| terms-64 | 127 | 78,018.88 ns / 12,817 / 8.40× | 49,827.14 ns / 20,069 / 13.16× | 655,494.48 ns / 1,526 / 1.00× |
| terms-512 | 1023 | 594,021.27 ns / 1,683 / 8.41× | 398,504.78 ns / 2,509 / 12.54× | 4,996,333.50 ns / 200 / 1.00× |
| terms-1024 | 2047 | 1,181,315.71 ns / 847 / 9.34× | 749,150.64 ns / 1,335 / 14.73× | 11,035,477.94 ns / 91 / 1.00× |
| terms-2048 | 4095 | 2,375,384.67 ns / 421 / 9.94× | 1,796,565.02 ns / 557 / 13.15× | 23,616,946.50 ns / 42 / 1.00× |
| terms-4096 | 8191 | 4,664,118.38 ns / 214 / 10.54× | 3,412,532.34 ns / 293 / 14.41× | 49,173,903.75 ns / 20 / 1.00× |
| terms-8192 | 16383 | 9,865,074.88 ns / 101 / 10.46× | 8,515,585.44 ns / 117 / 12.12× | 103,162,148.00 ns / 10 / 1.00× |
| terms-16384 | 32767 | 18,303,719.00 ns / 55 / 11.14× | 16,285,626.38 ns / 61 / 12.52× | 203,957,141.00 ns / 5 / 1.00× |

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
| chars-16 | 16 | 12,261.43 ns / 81,557 / 16.47× | 9,179.24 ns / 108,941 / 22.00× | 201,978.86 ns / 4,951 / 1.00× |
| chars-128 | 128 | 80,149.26 ns / 12,477 / 14.31× | 60,239.77 ns / 16,600 / 19.04× | 1,146,932.91 ns / 872 / 1.00× |
| chars-1024 | 1024 | 645,243.77 ns / 1,550 / 16.87× | 441,161.99 ns / 2,267 / 24.67× | 10,882,871.88 ns / 92 / 1.00× |
| chars-2048 | 2048 | 1,219,688.33 ns / 820 / 19.84× | 918,684.77 ns / 1,089 / 26.33× | 24,192,136.25 ns / 41 / 1.00× |
| chars-4096 | 4096 | 2,371,139.81 ns / 422 / 21.46× | 2,283,452.84 ns / 438 / 22.28× | 50,873,265.00 ns / 20 / 1.00× |
| chars-8192 | 8192 | 4,884,700.97 ns / 205 / 21.54× | 5,215,869.78 ns / 192 / 20.17× | 105,215,617.00 ns / 10 / 1.00× |
| chars-16384 | 16384 | 9,776,031.75 ns / 102 / 21.90× | 9,129,819.00 ns / 110 / 23.45× | 214,127,311.00 ns / 5 / 1.00× |
| chars-32768 | 32768 | 19,746,317.38 ns / 51 / 21.64× | 17,606,482.00 ns / 57 / 24.28× | 427,395,157.00 ns / 2 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
