# Tabnas measurement — 20260828T170850988Z-e5f6c05acfe5-suite-0.1.0-f0ee7f57

Generated 2026-08-28T17:08:50.988Z from suite `0.1.0` at commit `f0ee7f574ec762bf8189e44d0b1eff8c78c3cda7`.

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
| terms-8 | 15 | 12,449.47 ns / 80,325 / 1.00× | 7,675.00 ns / 130,293 / 1.62× |
| terms-64 | 127 | 83,654.46 ns / 11,954 / 1.00× | 49,788.56 ns / 20,085 / 1.68× |
| terms-512 | 1023 | 674,953.34 ns / 1,482 / 1.00× | 392,118.94 ns / 2,550 / 1.72× |
| terms-4096 | 8191 | 5,307,235.28 ns / 188 / 1.00× | 3,614,487.91 ns / 277 / 1.47× |

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
| chars-16 | 16 | 13,839.61 ns / 72,256 / 1.00× | 8,570.62 ns / 116,678 / 1.62× |
| chars-128 | 128 | 82,210.51 ns / 12,164 / 1.00× | 53,296.44 ns / 18,763 / 1.54× |
| chars-1024 | 1024 | 648,274.52 ns / 1,543 / 1.00× | 419,122.92 ns / 2,386 / 1.55× |
| chars-8192 | 8192 | 5,329,217.81 ns / 188 / 1.00× | 5,172,098.63 ns / 193 / 1.03× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
