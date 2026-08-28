# Tabnas measurement — 20260828T181912138Z-1a339841a70d-suite-0.2.0-cc736aff

Generated 2026-08-28T18:19:12.138Z from suite `0.2.0` at commit `cc736affa741220db6fde6b4840a8f73510668e4`.

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
| terms-8 | 15 | 14,156.23 ns / 70,640 / 1.00× | 8,777.34 ns / 113,930 / 1.61× |
| terms-64 | 127 | 103,111.21 ns / 9,698 / 1.00× | 54,524.06 ns / 18,341 / 1.89× |
| terms-512 | 1023 | 793,440.41 ns / 1,260 / 1.00× | 456,292.54 ns / 2,192 / 1.74× |
| terms-1024 | 2047 | 1,445,845.27 ns / 692 / 1.00× | 936,370.95 ns / 1,068 / 1.54× |
| terms-2048 | 4095 | 2,791,412.06 ns / 358 / 1.00× | 2,116,352.92 ns / 473 / 1.32× |
| terms-4096 | 8191 | 5,628,265.59 ns / 178 / 1.00× | 3,965,708.03 ns / 252 / 1.42× |
| terms-8192 | 16383 | 11,640,186.75 ns / 86 / 1.00× | 9,951,084.31 ns / 100 / 1.17× |
| terms-16384 | 32767 | 22,924,824.00 ns / 44 / 1.00× | 20,601,353.75 ns / 49 / 1.11× |

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
| chars-16 | 16 | 16,025.77 ns / 62,400 / 1.00× | 11,782.58 ns / 84,871 / 1.36× |
| chars-128 | 128 | 100,522.36 ns / 9,948 / 1.00× | 60,531.05 ns / 16,520 / 1.66× |
| chars-1024 | 1024 | 783,306.22 ns / 1,277 / 1.00× | 487,001.93 ns / 2,053 / 1.61× |
| chars-2048 | 2048 | 1,536,135.05 ns / 651 / 1.00× | 1,033,834.90 ns / 967 / 1.49× |
| chars-4096 | 4096 | 3,041,136.23 ns / 329 / 1.00× | 2,724,676.67 ns / 367 / 1.12× |
| chars-8192 | 8192 | 6,166,075.06 ns / 162 / 1.00× | 5,374,393.03 ns / 186 / 1.15× |
| chars-16384 | 16384 | 12,316,842.25 ns / 81 / 1.00× | 11,146,287.69 ns / 90 / 1.11× |
| chars-32768 | 32768 | 25,223,882.50 ns / 40 / 1.00× | 21,992,524.00 ns / 45 / 1.15× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
