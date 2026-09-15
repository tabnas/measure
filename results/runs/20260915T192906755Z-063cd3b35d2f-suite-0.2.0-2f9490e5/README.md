# Tabnas measurement — 20260915T192906755Z-063cd3b35d2f-suite-0.2.0-2f9490e5

Generated 2026-09-15T19:29:06.755Z from suite `0.2.0` at commit `2f9490e594820084d43ea0a70ca3dc1a977d51d1`.

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
| terms-8 | 15 | 10,880.16 ns / 91,910 / 1.89× | 6,996.29 ns / 142,933 / 2.94× | 20,552.12 ns / 48,657 / 1.00× |
| terms-64 | 127 | 82,351.16 ns / 12,143 / 1.81× | 44,276.96 ns / 22,585 / 3.37× | 149,371.77 ns / 6,695 / 1.00× |
| terms-512 | 1023 | 586,357.79 ns / 1,705 / 2.07× | 364,400.91 ns / 2,744 / 3.33× | 1,213,490.94 ns / 824 / 1.00× |
| terms-1024 | 2047 | 1,149,195.82 ns / 870 / 2.16× | 704,998.52 ns / 1,418 / 3.52× | 2,478,316.42 ns / 403 / 1.00× |
| terms-2048 | 4095 | 2,353,444.22 ns / 425 / 2.13× | 1,561,974.55 ns / 640 / 3.21× | 5,016,054.38 ns / 199 / 1.00× |
| terms-4096 | 8191 | 4,898,065.81 ns / 204 / 2.11× | 3,073,577.28 ns / 325 / 3.37× | 10,353,162.56 ns / 97 / 1.00× |
| terms-8192 | 16383 | 12,241,807.81 ns / 82 / 1.79× | 7,670,906.81 ns / 130 / 2.85× | 21,852,361.88 ns / 46 / 1.00× |
| terms-16384 | 32767 | 36,692,839.50 ns / 27 / 1.18× | 15,395,465.00 ns / 65 / 2.80× | 43,148,165.00 ns / 23 / 1.00× |

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
| chars-16 | 16 | 11,567.64 ns / 86,448 / 2.24× | 8,475.38 ns / 117,989 / 3.05× | 25,851.91 ns / 38,682 / 1.00× |
| chars-128 | 128 | 73,441.83 ns / 13,616 / 2.28× | 53,666.91 ns / 18,633 / 3.12× | 167,263.71 ns / 5,979 / 1.00× |
| chars-1024 | 1024 | 589,959.21 ns / 1,695 / 2.35× | 430,427.09 ns / 2,323 / 3.22× | 1,386,574.94 ns / 721 / 1.00× |
| chars-2048 | 2048 | 1,168,706.50 ns / 856 / 2.47× | 820,067.88 ns / 1,219 / 3.52× | 2,886,052.75 ns / 346 / 1.00× |
| chars-4096 | 4096 | 2,308,049.86 ns / 433 / 2.45× | 2,104,897.19 ns / 475 / 2.69× | 5,653,489.91 ns / 177 / 1.00× |
| chars-8192 | 8192 | 4,772,868.28 ns / 210 / 2.72× | 4,760,649.25 ns / 210 / 2.72× | 12,960,210.13 ns / 77 / 1.00× |
| chars-16384 | 16384 | 10,654,606.06 ns / 94 / 2.50× | 8,702,918.25 ns / 115 / 3.06× | 26,651,908.75 ns / 38 / 1.00× |
| chars-32768 | 32768 | 29,333,428.25 ns / 34 / 1.89× | 15,474,294.13 ns / 65 / 3.59× | 55,513,402.50 ns / 18 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
