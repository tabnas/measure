# Tabnas measurement — 20260915T125446234Z-063cd3b35d2f-suite-0.2.0-17a167ff

Generated 2026-09-15T12:54:46.234Z from suite `0.2.0` at commit `17a167ffd8d729b4aa62e75b0a42148953e4886d`.

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
| terms-8 | 15 | 10,836.29 ns / 92,283 / 10.79× | 7,368.03 ns / 135,721 / 15.87× | 116,893.06 ns / 8,555 / 1.00× |
| terms-64 | 127 | 74,804.68 ns / 13,368 / 8.86× | 48,797.56 ns / 20,493 / 13.58× | 662,879.91 ns / 1,509 / 1.00× |
| terms-512 | 1023 | 577,231.40 ns / 1,732 / 8.96× | 350,383.66 ns / 2,854 / 14.76× | 5,171,679.31 ns / 193 / 1.00× |
| terms-1024 | 2047 | 1,194,707.41 ns / 837 / 9.56× | 758,762.49 ns / 1,318 / 15.05× | 11,417,624.38 ns / 88 / 1.00× |
| terms-2048 | 4095 | 2,512,865.06 ns / 398 / 9.75× | 1,661,015.17 ns / 602 / 14.75× | 24,503,947.75 ns / 41 / 1.00× |
| terms-4096 | 8191 | 5,057,921.25 ns / 198 / 10.06× | 3,550,130.03 ns / 282 / 14.33× | 50,865,660.00 ns / 20 / 1.00× |
| terms-8192 | 16383 | 12,973,318.13 ns / 77 / 7.89× | 8,399,768.69 ns / 119 / 12.19× | 102,410,391.00 ns / 10 / 1.00× |
| terms-16384 | 32767 | 39,860,230.25 ns / 25 / 5.16× | 15,617,171.50 ns / 64 / 13.18× | 205,760,906.00 ns / 5 / 1.00× |

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
| chars-16 | 16 | 11,946.35 ns / 83,708 / 17.07× | 8,476.08 ns / 117,979 / 24.06× | 203,904.39 ns / 4,904 / 1.00× |
| chars-128 | 128 | 74,749.75 ns / 13,378 / 15.76× | 55,339.28 ns / 18,070 / 21.29× | 1,178,002.39 ns / 849 / 1.00× |
| chars-1024 | 1024 | 616,826.27 ns / 1,621 / 16.74× | 454,107.16 ns / 2,202 / 22.73× | 10,323,689.88 ns / 97 / 1.00× |
| chars-2048 | 2048 | 1,191,002.11 ns / 840 / 19.44× | 832,646.81 ns / 1,201 / 27.81× | 23,152,578.00 ns / 43 / 1.00× |
| chars-4096 | 4096 | 2,442,952.38 ns / 409 / 20.64× | 2,201,549.56 ns / 454 / 22.90× | 50,411,961.50 ns / 20 / 1.00× |
| chars-8192 | 8192 | 4,956,351.81 ns / 202 / 21.38× | 4,971,709.97 ns / 201 / 21.31× | 105,962,190.00 ns / 9 / 1.00× |
| chars-16384 | 16384 | 11,160,785.63 ns / 90 / 19.28× | 9,053,293.69 ns / 110 / 23.77× | 215,181,437.00 ns / 5 / 1.00× |
| chars-32768 | 32768 | 33,116,087.25 ns / 30 / 12.87× | 16,993,955.75 ns / 59 / 25.09× | 426,309,996.00 ns / 2 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
