# Tabnas measurement — 20260828T175247057Z-1a339841a70d-suite-0.1.0-eedcb98b

Generated 2026-08-28T17:52:47.057Z from suite `0.1.0` at commit `eedcb98b9fc9bd6b0156e77370eab992b3bfde69`.

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
| terms-8 | 15 | 13,456.71 ns / 74,312 / 1.00× | 8,990.97 ns / 111,223 / 1.50× |
| terms-64 | 127 | 89,924.76 ns / 11,120 / 1.00× | 55,052.86 ns / 18,164 / 1.63× |
| terms-512 | 1023 | 720,193.72 ns / 1,389 / 1.00× | 438,244.13 ns / 2,282 / 1.64× |
| terms-4096 | 8191 | 5,733,801.81 ns / 174 / 1.00× | 3,969,737.38 ns / 252 / 1.44× |

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
| chars-16 | 16 | 15,739.54 ns / 63,534 / 1.00× | 10,226.99 ns / 97,780 / 1.54× |
| chars-128 | 128 | 93,976.43 ns / 10,641 / 1.00× | 58,275.21 ns / 17,160 / 1.61× |
| chars-1024 | 1024 | 755,451.45 ns / 1,324 / 1.00× | 489,717.77 ns / 2,042 / 1.54× |
| chars-8192 | 8192 | 6,081,360.16 ns / 164 / 1.03× | 6,269,122.03 ns / 160 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
