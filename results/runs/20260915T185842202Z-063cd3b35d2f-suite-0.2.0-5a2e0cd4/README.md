# Tabnas measurement — 20260915T185842202Z-063cd3b35d2f-suite-0.2.0-5a2e0cd4

Generated 2026-09-15T18:58:42.202Z from suite `0.2.0` at commit `5a2e0cd4ddc485f2f7f903f15a6351d18a2b6e42`.

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
| terms-8 | 15 | 10,736.56 ns / 93,140 / 1.98× | 7,542.23 ns / 132,587 / 2.81× | 21,224.51 ns / 47,115 / 1.00× |
| terms-64 | 127 | 72,733.27 ns / 13,749 / 2.07× | 46,603.87 ns / 21,457 / 3.23× | 150,439.59 ns / 6,647 / 1.00× |
| terms-512 | 1023 | 595,089.41 ns / 1,680 / 2.08× | 363,255.06 ns / 2,753 / 3.41× | 1,239,494.07 ns / 807 / 1.00× |
| terms-1024 | 2047 | 1,260,847.47 ns / 793 / 2.00× | 768,436.53 ns / 1,301 / 3.27× | 2,515,679.16 ns / 398 / 1.00× |
| terms-2048 | 4095 | 2,587,351.63 ns / 386 / 1.97× | 1,633,800.42 ns / 612 / 3.11× | 5,083,501.34 ns / 197 / 1.00× |
| terms-4096 | 8191 | 4,792,889.56 ns / 209 / 2.28× | 3,342,410.28 ns / 299 / 3.27× | 10,943,815.69 ns / 91 / 1.00× |
| terms-8192 | 16383 | 9,890,844.00 ns / 101 / 2.41× | 7,920,777.06 ns / 126 / 3.01× | 23,853,823.38 ns / 42 / 1.00× |
| terms-16384 | 32767 | 18,963,580.00 ns / 53 / 2.63× | 15,156,015.75 ns / 66 / 3.29× | 49,796,697.50 ns / 20 / 1.00× |

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
| chars-16 | 16 | 11,887.19 ns / 84,124 / 2.18× | 8,650.88 ns / 115,595 / 3.00× | 25,912.99 ns / 38,591 / 1.00× |
| chars-128 | 128 | 75,785.79 ns / 13,195 / 2.31× | 52,642.92 ns / 18,996 / 3.32× | 174,864.55 ns / 5,719 / 1.00× |
| chars-1024 | 1024 | 602,767.77 ns / 1,659 / 2.45× | 404,661.16 ns / 2,471 / 3.66× | 1,478,892.79 ns / 676 / 1.00× |
| chars-2048 | 2048 | 1,138,706.03 ns / 878 / 2.61× | 887,160.59 ns / 1,127 / 3.35× | 2,968,935.36 ns / 337 / 1.00× |
| chars-4096 | 4096 | 2,364,150.52 ns / 423 / 2.51× | 2,247,466.77 ns / 445 / 2.64× | 5,925,844.59 ns / 169 / 1.00× |
| chars-8192 | 8192 | 4,570,413.00 ns / 219 / 2.74× | 4,643,336.06 ns / 215 / 2.70× | 12,518,735.63 ns / 80 / 1.00× |
| chars-16384 | 16384 | 9,608,269.75 ns / 104 / 3.04× | 8,396,658.75 ns / 119 / 3.47× | 29,162,543.50 ns / 34 / 1.00× |
| chars-32768 | 32768 | 20,013,516.88 ns / 50 / 2.94× | 16,057,354.25 ns / 62 / 3.67× | 58,858,252.50 ns / 17 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
