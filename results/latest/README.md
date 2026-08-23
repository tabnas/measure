# Tabnas measurement — 20260823T133827595Z-suite-0.1.0-bc89442a

Generated 2026-08-23T13:38:27.595Z from suite `0.1.0` at commit `bc89442adec49836cba36ff7fbd0039a9b96da29`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Hostname | `inch` |
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
| terms-8 | 15 | 41,663.71 ns / 24,002 / 1.00× | 28,479.12 ns / 35,113 / 1.46× |
| terms-64 | 127 | 246,915.46 ns / 4,050 / 1.00× | 120,840.99 ns / 8,275 / 2.04× |
| terms-512 | 1023 | 2,268,819.05 ns / 441 / 1.00× | 1,026,719.39 ns / 974 / 2.21× |
| terms-4096 | 8191 | 18,201,581.00 ns / 55 / 1.00× | 5,780,093.75 ns / 173 / 3.15× |

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
| chars-16 | 16 | 41,524.60 ns / 24,082 / 1.00× | 17,950.84 ns / 55,708 / 2.31× |
| chars-128 | 128 | 266,964.56 ns / 3,746 / 1.00× | 139,029.35 ns / 7,193 / 1.92× |
| chars-1024 | 1024 | 2,124,357.80 ns / 471 / 1.00× | 1,240,748.14 ns / 806 / 1.71× |
| chars-8192 | 8192 | 15,586,852.88 ns / 64 / 1.00× | 14,377,671.75 ns / 70 / 1.08× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
