# Tabnas measurement — 20260828T181239503Z-1a339841a70d-suite-0.1.0-ea34692c

Generated 2026-08-28T18:12:39.503Z from suite `0.1.0` at commit `ea34692cb8abced30070f63a4d1a6ee270ea29a4`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `1a339841a70d` |
| Operating system | `darwin (darwin/amd64)` |
| Kernel | `21.6.0` |
| Processor | `Intel(R) Core(TM) i7-6660U CPU @ 2.40GHz` |
| Logical CPUs | 4 |
| Memory | 16.00 GiB (17,179,869,184 bytes) |
| Environment fingerprint | `4f7afaa40f2615e34299a044dd578f7f7c925a2a0f1ff691d6a960ca482d21c2` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.11.1 |
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
| terms-8 | 15 | 14,659.39 ns / 68,216 / 1.00× | 9,805.57 ns / 101,983 / 1.50× |
| terms-64 | 127 | 103,447.55 ns / 9,667 / 1.00× | 60,778.44 ns / 16,453 / 1.70× |
| terms-512 | 1023 | 823,835.62 ns / 1,214 / 1.00× | 482,538.96 ns / 2,072 / 1.71× |
| terms-4096 | 8191 | 6,363,225.94 ns / 157 / 1.00× | 4,266,692.13 ns / 234 / 1.49× |

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
| chars-16 | 16 | 17,270.94 ns / 57,901 / 1.00× | 10,111.60 ns / 98,896 / 1.71× |
| chars-128 | 128 | 104,035.03 ns / 9,612 / 1.00× | 63,026.01 ns / 15,866 / 1.65× |
| chars-1024 | 1024 | 820,498.42 ns / 1,219 / 1.00× | 504,965.52 ns / 1,980 / 1.63× |
| chars-8192 | 8192 | 6,580,195.38 ns / 152 / 1.00× | 5,893,476.25 ns / 170 / 1.12× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
