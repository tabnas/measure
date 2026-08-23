# Tabnas measurement — 20260823T141535818Z-inch-suite-0.1.0-bbfab8db

Generated 2026-08-23T14:15:35.818Z from suite `0.1.0` at commit `bbfab8dbd6bc795eb05257d6365eefd26bbd400f`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host | `inch · Intel Core m3` |
| Host ID | `inch` |
| Observed hostname | `inch` |
| Operating system | `Ubuntu 24.04.4 LTS (linux/amd64)` |
| Kernel | `6.8.0-137-generic` |
| Processor | `Intel(R) Core(TM) m3-6Y30 CPU @ 0.90GHz` |
| Logical CPUs | 4 |
| Memory | 7.65 GiB (8,219,103,232 bytes) |
| Environment fingerprint | `6163022ce2b319c20cb1a337223fb3a4023207e3dc44d9875b54dfc293274ead` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.14.1 |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.1 |

## Adder grammar

Canonical Tabnas integer-addition grammar with semantic accumulation.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go |
| --- | --- | --- | --- |
| single | `1` | pass `1` | pass `1` |
| chain | `6` | pass `6` | pass `6` |
| multi-digit | `60` | pass `60` | pass `60` |
| trailing-plus | reject | pass (rejected) | pass (rejected) |
| leading-plus | reject | pass (rejected) | pass (rejected) |
| double-plus | reject | pass (rejected) | pass (rejected) |
| unknown-token | reject | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: |
| terms-8 | 15 | 38,857.00 ns / 25,735 / 1.02× | 39,641.90 ns / 25,226 / 1.00× |
| terms-64 | 127 | 274,017.55 ns / 3,649 / 1.00× | 136,468.72 ns / 7,328 / 2.01× |
| terms-512 | 1023 | 2,167,144.84 ns / 461 / 1.00× | 1,023,825.30 ns / 977 / 2.12× |
| terms-4096 | 8191 | 16,719,813.63 ns / 60 / 1.00× | 9,305,712.50 ns / 107 / 1.80× |

## Even palindromes

Classic non-deterministic context-free language resolved with full parse context.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go |
| --- | --- | --- | --- |
| empty | `true` | pass `true` | pass `true` |
| pair-a | `true` | pass `true` | pass `true` |
| pair-b | `true` | pass `true` | pass `true` |
| nested | `true` | pass `true` | pass `true` |
| length-six | `true` | pass `true` | pass `true` |
| odd-length | reject | pass (rejected) | pass (rejected) |
| not-mirrored | reject | pass (rejected) | pass (rejected) |
| wrong-close | reject | pass (rejected) | pass (rejected) |
| outside-alphabet | reject | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: |
| chars-16 | 16 | 42,636.05 ns / 23,454 / 1.00× | 20,855.19 ns / 47,950 / 2.04× |
| chars-128 | 128 | 250,275.56 ns / 3,996 / 1.00× | 165,648.21 ns / 6,037 / 1.51× |
| chars-1024 | 1024 | 2,237,383.47 ns / 447 / 1.00× | 1,047,369.28 ns / 955 / 2.14× |
| chars-8192 | 8192 | 17,727,383.00 ns / 56 / 1.00× | 16,589,198.94 ns / 60 / 1.07× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
