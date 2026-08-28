# Tabnas measurement — 20260828T183325548Z-e5f6c05acfe5-suite-0.2.0-df30847b

Generated 2026-08-28T18:33:25.548Z from suite `0.2.0` at commit `df30847b67f8580f8b88de5df93caf8ef7da2e24`.

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
| terms-8 | 15 | 11,622.65 ns / 86,039 / 1.00× | 7,624.86 ns / 131,150 / 1.52× |
| terms-64 | 127 | 81,926.39 ns / 12,206 / 1.00× | 49,868.72 ns / 20,053 / 1.64× |
| terms-512 | 1023 | 660,967.66 ns / 1,513 / 1.00× | 390,967.83 ns / 2,558 / 1.69× |
| terms-1024 | 2047 | 1,319,124.70 ns / 758 / 1.00× | 816,021.70 ns / 1,225 / 1.62× |
| terms-2048 | 4095 | 2,595,103.02 ns / 385 / 1.00× | 1,802,415.77 ns / 555 / 1.44× |
| terms-4096 | 8191 | 5,280,371.28 ns / 189 / 1.00× | 3,595,061.50 ns / 278 / 1.47× |
| terms-8192 | 16383 | 11,064,021.50 ns / 90 / 1.00× | 8,989,003.06 ns / 111 / 1.23× |
| terms-16384 | 32767 | 20,070,967.25 ns / 50 / 1.00× | 18,460,212.63 ns / 54 / 1.09× |

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
| chars-16 | 16 | 13,618.67 ns / 73,429 / 1.00× | 8,723.00 ns / 114,639 / 1.56× |
| chars-128 | 128 | 88,199.29 ns / 11,338 / 1.00× | 53,518.43 ns / 18,685 / 1.65× |
| chars-1024 | 1024 | 666,346.27 ns / 1,501 / 1.00× | 417,202.44 ns / 2,397 / 1.60× |
| chars-2048 | 2048 | 1,280,603.96 ns / 781 / 1.00× | 895,738.80 ns / 1,116 / 1.43× |
| chars-4096 | 4096 | 2,602,435.53 ns / 384 / 1.00× | 2,259,085.81 ns / 443 / 1.15× |
| chars-8192 | 8192 | 5,206,223.59 ns / 192 / 1.00× | 4,967,800.41 ns / 201 / 1.05× |
| chars-16384 | 16384 | 10,649,002.81 ns / 94 / 1.00× | 10,062,611.13 ns / 99 / 1.06× |
| chars-32768 | 32768 | 22,489,469.00 ns / 44 / 1.00× | 19,636,570.88 ns / 51 / 1.15× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
