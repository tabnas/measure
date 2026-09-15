# Tabnas measurement — 20260915T191334778Z-063cd3b35d2f-suite-0.2.0-cdfcad42

Generated 2026-09-15T19:13:34.778Z from suite `0.2.0` at commit `cdfcad42210dfcdaef2eca30cee3aa3aee67231c`.

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
| terms-8 | 15 | 11,413.13 ns / 87,618 / 1.79× | 7,733.90 ns / 129,301 / 2.64× | 20,384.84 ns / 49,056 / 1.00× |
| terms-64 | 127 | 81,501.90 ns / 12,270 / 1.83× | 51,597.42 ns / 19,381 / 2.89× | 149,048.75 ns / 6,709 / 1.00× |
| terms-512 | 1023 | 614,756.80 ns / 1,627 / 1.98× | 373,730.72 ns / 2,676 / 3.25× | 1,215,244.48 ns / 823 / 1.00× |
| terms-1024 | 2047 | 1,327,838.30 ns / 753 / 1.86× | 784,920.39 ns / 1,274 / 3.14× | 2,467,176.58 ns / 405 / 1.00× |
| terms-2048 | 4095 | 2,367,809.03 ns / 422 / 2.11× | 1,635,347.03 ns / 611 / 3.05× | 4,992,201.25 ns / 200 / 1.00× |
| terms-4096 | 8191 | 5,009,634.78 ns / 200 / 2.16× | 3,418,001.66 ns / 293 / 3.16× | 10,799,669.38 ns / 93 / 1.00× |
| terms-8192 | 16383 | 11,008,760.13 ns / 91 / 2.00× | 8,374,295.88 ns / 119 / 2.63× | 22,061,831.38 ns / 45 / 1.00× |
| terms-16384 | 32767 | 18,428,711.75 ns / 54 / 2.55× | 15,781,354.00 ns / 63 / 2.98× | 47,061,802.25 ns / 21 / 1.00× |

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
| chars-16 | 16 | 11,945.23 ns / 83,715 / 2.08× | 8,692.61 ns / 115,040 / 2.86× | 24,826.58 ns / 40,279 / 1.00× |
| chars-128 | 128 | 76,958.85 ns / 12,994 / 2.18× | 53,060.98 ns / 18,846 / 3.17× | 168,027.67 ns / 5,951 / 1.00× |
| chars-1024 | 1024 | 602,079.56 ns / 1,661 / 2.37× | 415,767.15 ns / 2,405 / 3.44× | 1,428,949.14 ns / 700 / 1.00× |
| chars-2048 | 2048 | 1,152,979.69 ns / 867 / 2.46× | 839,979.73 ns / 1,191 / 3.37× | 2,832,606.33 ns / 353 / 1.00× |
| chars-4096 | 4096 | 2,352,129.22 ns / 425 / 2.70× | 2,208,530.36 ns / 453 / 2.87× | 6,342,186.06 ns / 158 / 1.00× |
| chars-8192 | 8192 | 4,926,140.78 ns / 203 / 2.96× | 4,958,327.03 ns / 202 / 2.94× | 14,592,843.25 ns / 69 / 1.00× |
| chars-16384 | 16384 | 9,715,628.00 ns / 103 / 3.14× | 10,106,902.06 ns / 99 / 3.01× | 30,464,233.00 ns / 33 / 1.00× |
| chars-32768 | 32768 | 19,447,385.63 ns / 51 / 3.13× | 18,235,921.00 ns / 55 / 3.34× | 60,811,407.50 ns / 16 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
