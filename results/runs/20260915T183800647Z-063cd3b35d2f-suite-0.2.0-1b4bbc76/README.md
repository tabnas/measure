# Tabnas measurement — 20260915T183800647Z-063cd3b35d2f-suite-0.2.0-1b4bbc76

Generated 2026-09-15T18:38:00.647Z from suite `0.2.0` at commit `1b4bbc7620b6eac457ccabee7e3628a74973f379`.

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
| terms-8 | 15 | 11,367.23 ns / 87,972 / 2.36× | 7,686.68 ns / 130,095 / 3.48× | 26,782.22 ns / 37,338 / 1.00× |
| terms-64 | 127 | 76,290.34 ns / 13,108 / 2.62× | 49,073.32 ns / 20,378 / 4.08× | 200,149.37 ns / 4,996 / 1.00× |
| terms-512 | 1023 | 586,461.32 ns / 1,705 / 2.61× | 362,477.79 ns / 2,759 / 4.22× | 1,531,202.40 ns / 653 / 1.00× |
| terms-1024 | 2047 | 1,240,759.63 ns / 806 / 2.46× | 749,373.31 ns / 1,334 / 4.08× | 3,054,834.27 ns / 327 / 1.00× |
| terms-2048 | 4095 | 2,375,564.20 ns / 421 / 2.71× | 1,711,456.95 ns / 584 / 3.76× | 6,426,086.81 ns / 156 / 1.00× |
| terms-4096 | 8191 | 4,892,784.09 ns / 204 / 2.84× | 3,398,862.50 ns / 294 / 4.08× | 13,870,298.00 ns / 72 / 1.00× |
| terms-8192 | 16383 | 9,406,781.56 ns / 106 / 3.20× | 8,096,312.88 ns / 124 / 3.71× | 30,072,234.00 ns / 33 / 1.00× |
| terms-16384 | 32767 | 18,491,789.00 ns / 54 / 3.36× | 15,946,480.38 ns / 63 / 3.89× | 62,084,402.50 ns / 16 / 1.00× |

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
| chars-16 | 16 | 12,406.36 ns / 80,604 / 2.78× | 9,121.79 ns / 109,628 / 3.78× | 34,446.19 ns / 29,031 / 1.00× |
| chars-128 | 128 | 79,995.41 ns / 12,501 / 2.99× | 51,508.17 ns / 19,414 / 4.64× | 239,075.41 ns / 4,183 / 1.00× |
| chars-1024 | 1024 | 634,326.09 ns / 1,576 / 2.87× | 408,748.61 ns / 2,446 / 4.46× | 1,823,045.13 ns / 549 / 1.00× |
| chars-2048 | 2048 | 1,192,563.32 ns / 839 / 3.14× | 843,850.73 ns / 1,185 / 4.44× | 3,743,963.94 ns / 267 / 1.00× |
| chars-4096 | 4096 | 2,357,991.55 ns / 424 / 3.30× | 2,208,531.73 ns / 453 / 3.53× | 7,788,451.06 ns / 128 / 1.00× |
| chars-8192 | 8192 | 4,696,345.84 ns / 213 / 3.76× | 4,920,578.19 ns / 203 / 3.58× | 17,633,551.75 ns / 57 / 1.00× |
| chars-16384 | 16384 | 9,895,012.81 ns / 101 / 4.16× | 9,181,550.50 ns / 109 / 4.49× | 41,181,364.75 ns / 24 / 1.00× |
| chars-32768 | 32768 | 19,584,114.25 ns / 51 / 4.44× | 17,253,463.13 ns / 58 / 5.03× | 86,854,587.00 ns / 12 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
