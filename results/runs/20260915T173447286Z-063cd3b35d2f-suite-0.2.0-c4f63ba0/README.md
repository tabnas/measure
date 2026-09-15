# Tabnas measurement — 20260915T173447286Z-063cd3b35d2f-suite-0.2.0-c4f63ba0

Generated 2026-09-15T17:34:47.286Z from suite `0.2.0` at commit `c4f63ba0d18347be7313875121b0770b80a9262f`.

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
| terms-8 | 15 | 11,015.00 ns / 90,785 / 3.32× | 7,044.81 ns / 141,948 / 5.19× | 36,561.53 ns / 27,351 / 1.00× |
| terms-64 | 127 | 72,621.88 ns / 13,770 / 3.08× | 44,521.84 ns / 22,461 / 5.03× | 223,786.11 ns / 4,469 / 1.00× |
| terms-512 | 1023 | 586,920.91 ns / 1,704 / 2.85× | 348,695.95 ns / 2,868 / 4.80× | 1,675,233.88 ns / 597 / 1.00× |
| terms-1024 | 2047 | 1,203,585.38 ns / 831 / 2.84× | 732,592.29 ns / 1,365 / 4.66× | 3,414,933.50 ns / 293 / 1.00× |
| terms-2048 | 4095 | 2,382,328.70 ns / 420 / 3.07× | 1,687,441.41 ns / 593 / 4.34× | 7,318,426.75 ns / 137 / 1.00× |
| terms-4096 | 8191 | 4,719,058.09 ns / 212 / 3.28× | 3,511,398.47 ns / 285 / 4.41× | 15,473,551.75 ns / 65 / 1.00× |
| terms-8192 | 16383 | 9,678,510.19 ns / 103 / 3.42× | 8,030,364.44 ns / 125 / 4.13× | 33,129,829.75 ns / 30 / 1.00× |
| terms-16384 | 32767 | 17,802,616.63 ns / 56 / 3.92× | 16,000,915.38 ns / 62 / 4.37× | 69,859,257.50 ns / 14 / 1.00× |

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
| chars-16 | 16 | 11,936.88 ns / 83,774 / 4.18× | 8,318.66 ns / 120,212 / 6.00× | 49,890.42 ns / 20,044 / 1.00× |
| chars-128 | 128 | 76,424.01 ns / 13,085 / 3.62× | 49,907.49 ns / 20,037 / 5.54× | 276,245.87 ns / 3,620 / 1.00× |
| chars-1024 | 1024 | 599,742.62 ns / 1,667 / 3.36× | 415,995.61 ns / 2,404 / 4.85× | 2,016,638.31 ns / 496 / 1.00× |
| chars-2048 | 2048 | 1,135,763.40 ns / 880 / 3.59× | 836,526.02 ns / 1,195 / 4.88× | 4,080,163.75 ns / 245 / 1.00× |
| chars-4096 | 4096 | 2,273,143.03 ns / 440 / 4.04× | 2,158,996.44 ns / 463 / 4.26× | 9,186,074.13 ns / 109 / 1.00× |
| chars-8192 | 8192 | 4,648,140.06 ns / 215 / 4.67× | 4,998,824.75 ns / 200 / 4.34× | 21,694,008.63 ns / 46 / 1.00× |
| chars-16384 | 16384 | 9,243,343.13 ns / 108 / 5.31× | 9,061,279.13 ns / 110 / 5.42× | 49,103,302.50 ns / 20 / 1.00× |
| chars-32768 | 32768 | 19,305,977.88 ns / 52 / 5.42× | 18,053,336.00 ns / 55 / 5.80× | 104,618,677.00 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
