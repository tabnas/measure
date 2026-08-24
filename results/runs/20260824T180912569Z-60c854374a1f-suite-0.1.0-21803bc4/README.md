# Tabnas measurement — 20260824T180912569Z-60c854374a1f-suite-0.1.0-21803bc4

Generated 2026-08-24T18:09:12.569Z from suite `0.1.0` at commit `21803bc49426fea77ea42f9d4c7ee813dde6efbb`.

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
| terms-8 | 15 | 18,228.36 ns / 54,860 / 1.00× | 11,767.22 ns / 84,982 / 1.55× |
| terms-64 | 127 | 117,803.71 ns / 8,489 / 1.00× | 73,425.83 ns / 13,619 / 1.60× |
| terms-512 | 1023 | 918,006.20 ns / 1,089 / 1.00× | 579,772.73 ns / 1,725 / 1.58× |
| terms-4096 | 8191 | 7,632,107.13 ns / 131 / 1.00× | 5,477,817.31 ns / 183 / 1.39× |

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
| chars-16 | 16 | 20,131.94 ns / 49,672 / 1.00× | 13,431.09 ns / 74,454 / 1.50× |
| chars-128 | 128 | 129,127.13 ns / 7,744 / 1.00× | 82,203.56 ns / 12,165 / 1.57× |
| chars-1024 | 1024 | 950,993.14 ns / 1,052 / 1.00× | 645,929.47 ns / 1,548 / 1.47× |
| chars-8192 | 8192 | 7,926,904.94 ns / 126 / 1.09× | 8,667,622.06 ns / 115 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
