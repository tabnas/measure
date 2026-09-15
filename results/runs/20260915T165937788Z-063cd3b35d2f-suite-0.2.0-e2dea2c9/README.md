# Tabnas measurement — 20260915T165937788Z-063cd3b35d2f-suite-0.2.0-e2dea2c9

Generated 2026-09-15T16:59:37.788Z from suite `0.2.0` at commit `e2dea2c9ee14954928d7dc7fd92570fa7dfa1ff0`.

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
| terms-8 | 15 | 11,666.31 ns / 85,717 / 5.07× | 7,303.97 ns / 136,912 / 8.10× | 59,131.66 ns / 16,911 / 1.00× |
| terms-64 | 127 | 78,087.32 ns / 12,806 / 3.19× | 44,544.09 ns / 22,450 / 5.59× | 249,000.86 ns / 4,016 / 1.00× |
| terms-512 | 1023 | 617,747.00 ns / 1,619 / 2.80× | 366,446.58 ns / 2,729 / 4.72× | 1,728,378.38 ns / 579 / 1.00× |
| terms-1024 | 2047 | 1,237,312.70 ns / 808 / 2.83× | 747,470.34 ns / 1,338 / 4.68× | 3,501,333.00 ns / 286 / 1.00× |
| terms-2048 | 4095 | 2,399,400.16 ns / 417 / 3.12× | 1,605,864.31 ns / 623 / 4.65× | 7,474,036.75 ns / 134 / 1.00× |
| terms-4096 | 8191 | 4,852,334.47 ns / 206 / 3.29× | 3,278,462.97 ns / 305 / 4.86× | 15,937,879.38 ns / 63 / 1.00× |
| terms-8192 | 16383 | 9,294,602.31 ns / 108 / 3.63× | 8,218,424.44 ns / 122 / 4.11× | 33,770,111.75 ns / 30 / 1.00× |
| terms-16384 | 32767 | 18,538,330.38 ns / 54 / 3.82× | 16,125,544.63 ns / 62 / 4.39× | 70,823,066.50 ns / 14 / 1.00× |

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
| chars-16 | 16 | 12,092.33 ns / 82,697 / 6.18× | 9,966.00 ns / 100,341 / 7.50× | 74,701.07 ns / 13,387 / 1.00× |
| chars-128 | 128 | 78,632.54 ns / 12,717 / 3.83× | 53,615.32 ns / 18,651 / 5.61× | 300,867.95 ns / 3,324 / 1.00× |
| chars-1024 | 1024 | 627,267.98 ns / 1,594 / 3.27× | 421,246.46 ns / 2,374 / 4.88× | 2,053,501.77 ns / 487 / 1.00× |
| chars-2048 | 2048 | 1,157,302.72 ns / 864 / 3.62× | 847,872.66 ns / 1,179 / 4.94× | 4,188,416.31 ns / 239 / 1.00× |
| chars-4096 | 4096 | 2,428,093.19 ns / 412 / 3.88× | 2,121,849.70 ns / 471 / 4.44× | 9,410,359.50 ns / 106 / 1.00× |
| chars-8192 | 8192 | 4,926,841.41 ns / 203 / 4.18× | 5,592,474.53 ns / 179 / 3.68× | 20,598,354.25 ns / 49 / 1.00× |
| chars-16384 | 16384 | 9,656,196.13 ns / 104 / 5.04× | 9,945,616.38 ns / 101 / 4.89× | 48,617,696.50 ns / 21 / 1.00× |
| chars-32768 | 32768 | 19,902,035.88 ns / 50 / 5.22× | 17,800,648.00 ns / 56 / 5.83× | 103,857,231.00 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
