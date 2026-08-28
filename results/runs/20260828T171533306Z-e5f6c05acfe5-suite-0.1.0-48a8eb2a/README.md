# Tabnas measurement — 20260828T171533306Z-e5f6c05acfe5-suite-0.1.0-48a8eb2a

Generated 2026-08-28T17:15:33.306Z from suite `0.1.0` at commit `48a8eb2a92bf13109055b96e73b9776a5ef195b6`.

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
| terms-8 | 15 | 11,650.83 ns / 85,831 / 1.00× | 7,680.50 ns / 130,200 / 1.52× |
| terms-64 | 127 | 83,303.01 ns / 12,004 / 1.00× | 50,771.63 ns / 19,696 / 1.64× |
| terms-512 | 1023 | 655,294.85 ns / 1,526 / 1.00× | 395,191.61 ns / 2,530 / 1.66× |
| terms-4096 | 8191 | 5,200,382.47 ns / 192 / 1.00× | 3,633,249.19 ns / 275 / 1.43× |

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
| chars-16 | 16 | 13,679.63 ns / 73,101 / 1.00× | 8,740.06 ns / 114,416 / 1.57× |
| chars-128 | 128 | 84,822.20 ns / 11,789 / 1.00× | 54,747.79 ns / 18,266 / 1.55× |
| chars-1024 | 1024 | 655,562.35 ns / 1,525 / 1.00× | 426,644.35 ns / 2,344 / 1.54× |
| chars-8192 | 8192 | 5,323,069.03 ns / 188 / 1.00× | 5,058,159.53 ns / 198 / 1.05× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
