# Tabnas measurement — 20260824T174621785Z-60c854374a1f-suite-0.1.0-ba627922

Generated 2026-08-24T17:46:21.785Z from suite `0.1.0` at commit `ba6279221fa420e9364f86705b1736451511451e`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `60c854374a1f` |
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
| terms-8 | 15 | 18,594.64 ns / 53,779 / 1.00× | 11,555.22 ns / 86,541 / 1.61× |
| terms-64 | 127 | 126,751.08 ns / 7,889 / 1.00× | 74,168.72 ns / 13,483 / 1.71× |
| terms-512 | 1023 | 1,133,150.17 ns / 882 / 1.00× | 569,090.00 ns / 1,757 / 1.99× |
| terms-4096 | 8191 | 7,552,292.25 ns / 132 / 1.00× | 5,495,228.72 ns / 182 / 1.37× |

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
| chars-16 | 16 | 20,140.92 ns / 49,650 / 1.00× | 13,607.19 ns / 73,491 / 1.48× |
| chars-128 | 128 | 129,543.37 ns / 7,719 / 1.00× | 82,734.45 ns / 12,087 / 1.57× |
| chars-1024 | 1024 | 950,031.44 ns / 1,053 / 1.00× | 671,967.07 ns / 1,488 / 1.41× |
| chars-8192 | 8192 | 8,259,809.44 ns / 121 / 1.03× | 8,465,083.06 ns / 118 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
