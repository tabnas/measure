# Tabnas measurement — 20260828T174417639Z-e5f6c05acfe5-suite-0.1.0-ae1c0f65

Generated 2026-08-28T17:44:17.639Z from suite `0.1.0` at commit `ae1c0f654bf626b22386ace556664542e3b5dab0`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `e5f6c05acfe5` |
| Operating system | `Oracle Linux Server 9.8 (linux/arm64)` |
| Kernel | `6.12.0-205.92.4.2.el9uek.aarch64` |
| Processor | `Neoverse-N1` |
| Logical CPUs | 2 |
| Memory | 10.64 GiB (11,427,643,392 bytes) |
| Environment fingerprint | `16e56d5a691ea761d98c254c4812b9e9aef4d38e902ed4a63852430f82aeaa7b` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.20.0 |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.5 (Red Hat 1.26.5-1.0.1.el9_8) |

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
| terms-8 | 15 | 11,988.29 ns / 83,415 / 1.00× | 7,571.23 ns / 132,079 / 1.58× |
| terms-64 | 127 | 82,339.32 ns / 12,145 / 1.00× | 50,309.62 ns / 19,877 / 1.64× |
| terms-512 | 1023 | 653,299.99 ns / 1,531 / 1.00× | 394,987.38 ns / 2,532 / 1.65× |
| terms-4096 | 8191 | 5,242,901.19 ns / 191 / 1.00× | 3,567,093.94 ns / 280 / 1.47× |

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
| chars-16 | 16 | 14,554.39 ns / 68,708 / 1.00× | 8,623.12 ns / 115,967 / 1.69× |
| chars-128 | 128 | 87,186.63 ns / 11,470 / 1.00× | 53,655.54 ns / 18,637 / 1.63× |
| chars-1024 | 1024 | 644,202.46 ns / 1,552 / 1.00× | 423,128.24 ns / 2,363 / 1.52× |
| chars-8192 | 8192 | 5,279,302.53 ns / 189 / 1.00× | 5,166,005.97 ns / 194 / 1.02× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
