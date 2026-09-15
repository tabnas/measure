# Tabnas measurement — 20260915T190034373Z-063cd3b35d2f-suite-0.2.0-549d3ffc

Generated 2026-09-15T19:00:34.373Z from suite `0.2.0` at commit `549d3ffc188f1e7ca03dae17fd1ad164892d4224`.

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
| terms-8 | 15 | 11,046.77 ns / 90,524 / 1.91× | 7,143.93 ns / 139,979 / 2.96× | 21,129.38 ns / 47,327 / 1.00× |
| terms-64 | 127 | 73,681.57 ns / 13,572 / 2.11× | 44,851.37 ns / 22,296 / 3.46× | 155,280.07 ns / 6,440 / 1.00× |
| terms-512 | 1023 | 609,423.11 ns / 1,641 / 2.14× | 363,128.04 ns / 2,754 / 3.60× | 1,305,559.85 ns / 766 / 1.00× |
| terms-1024 | 2047 | 1,206,515.54 ns / 829 / 2.13× | 731,418.79 ns / 1,367 / 3.52× | 2,574,765.53 ns / 388 / 1.00× |
| terms-2048 | 4095 | 2,427,200.45 ns / 412 / 2.18× | 1,724,574.02 ns / 580 / 3.07× | 5,301,261.72 ns / 189 / 1.00× |
| terms-4096 | 8191 | 4,812,432.19 ns / 208 / 2.31× | 3,379,171.50 ns / 296 / 3.28× | 11,098,636.56 ns / 90 / 1.00× |
| terms-8192 | 16383 | 9,956,363.88 ns / 100 / 2.29× | 8,114,444.44 ns / 123 / 2.81× | 22,797,883.50 ns / 44 / 1.00× |
| terms-16384 | 32767 | 18,034,558.00 ns / 55 / 2.56× | 16,238,972.50 ns / 62 / 2.84× | 46,185,069.75 ns / 22 / 1.00× |

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
| chars-16 | 16 | 12,108.63 ns / 82,586 / 2.27× | 9,304.00 ns / 107,481 / 2.95× | 27,453.01 ns / 36,426 / 1.00× |
| chars-128 | 128 | 77,986.24 ns / 12,823 / 2.21× | 55,770.43 ns / 17,931 / 3.09× | 172,444.15 ns / 5,799 / 1.00× |
| chars-1024 | 1024 | 608,480.95 ns / 1,643 / 2.38× | 460,121.86 ns / 2,173 / 3.15× | 1,448,014.30 ns / 691 / 1.00× |
| chars-2048 | 2048 | 1,181,296.63 ns / 847 / 2.50× | 944,708.58 ns / 1,059 / 3.13× | 2,955,095.30 ns / 338 / 1.00× |
| chars-4096 | 4096 | 2,342,566.05 ns / 427 / 2.60× | 2,306,572.42 ns / 434 / 2.64× | 6,096,028.09 ns / 164 / 1.00× |
| chars-8192 | 8192 | 4,764,244.53 ns / 210 / 2.93× | 5,200,872.50 ns / 192 / 2.69× | 13,969,475.13 ns / 72 / 1.00× |
| chars-16384 | 16384 | 9,601,317.94 ns / 104 / 3.09× | 9,241,504.56 ns / 108 / 3.21× | 29,635,062.75 ns / 34 / 1.00× |
| chars-32768 | 32768 | 19,292,315.63 ns / 52 / 3.23× | 17,563,658.25 ns / 57 / 3.55× | 62,321,282.50 ns / 16 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
