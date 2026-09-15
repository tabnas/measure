# Tabnas measurement — 20260915T183610724Z-063cd3b35d2f-suite-0.2.0-042f11c5

Generated 2026-09-15T18:36:10.724Z from suite `0.2.0` at commit `042f11c5aadc3f57d24eb651d5796aeaf31b2e9a`.

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
| terms-8 | 15 | 11,657.76 ns / 85,780 / 2.31× | 7,545.40 ns / 132,531 / 3.57× | 26,920.46 ns / 37,146 / 1.00× |
| terms-64 | 127 | 77,643.22 ns / 12,879 / 2.54× | 45,456.65 ns / 21,999 / 4.34× | 197,110.65 ns / 5,073 / 1.00× |
| terms-512 | 1023 | 593,366.23 ns / 1,685 / 2.47× | 378,469.84 ns / 2,642 / 3.87× | 1,465,152.08 ns / 683 / 1.00× |
| terms-1024 | 2047 | 1,179,206.66 ns / 848 / 2.50× | 732,083.84 ns / 1,366 / 4.03× | 2,952,484.66 ns / 339 / 1.00× |
| terms-2048 | 4095 | 2,369,476.92 ns / 422 / 2.65× | 1,630,294.69 ns / 613 / 3.85× | 6,275,536.66 ns / 159 / 1.00× |
| terms-4096 | 8191 | 4,888,067.03 ns / 205 / 2.72× | 3,523,227.88 ns / 284 / 3.78× | 13,307,755.38 ns / 75 / 1.00× |
| terms-8192 | 16383 | 9,279,523.06 ns / 108 / 3.23× | 9,213,193.25 ns / 109 / 3.25× | 29,939,356.50 ns / 33 / 1.00× |
| terms-16384 | 32767 | 18,699,732.63 ns / 53 / 3.12× | 17,758,071.50 ns / 56 / 3.29× | 58,412,908.00 ns / 17 / 1.00× |

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
| chars-16 | 16 | 12,086.46 ns / 82,737 / 2.78× | 9,330.13 ns / 107,180 / 3.60× | 33,565.56 ns / 29,792 / 1.00× |
| chars-128 | 128 | 77,210.86 ns / 12,952 / 2.96× | 58,016.89 ns / 17,236 / 3.94× | 228,500.31 ns / 4,376 / 1.00× |
| chars-1024 | 1024 | 609,114.41 ns / 1,642 / 2.91× | 441,017.60 ns / 2,267 / 4.01× | 1,769,459.47 ns / 565 / 1.00× |
| chars-2048 | 2048 | 1,158,151.56 ns / 863 / 3.10× | 871,150.41 ns / 1,148 / 4.12× | 3,592,350.03 ns / 278 / 1.00× |
| chars-4096 | 4096 | 2,406,669.55 ns / 416 / 3.09× | 2,302,875.30 ns / 434 / 3.23× | 7,425,753.00 ns / 135 / 1.00× |
| chars-8192 | 8192 | 4,814,773.38 ns / 208 / 3.41× | 4,996,461.38 ns / 200 / 3.28× | 16,407,909.63 ns / 61 / 1.00× |
| chars-16384 | 16384 | 9,800,482.69 ns / 102 / 4.07× | 8,843,627.88 ns / 113 / 4.51× | 39,855,109.50 ns / 25 / 1.00× |
| chars-32768 | 32768 | 20,059,513.25 ns / 50 / 4.34× | 17,195,631.63 ns / 58 / 5.06× | 87,054,266.50 ns / 11 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
