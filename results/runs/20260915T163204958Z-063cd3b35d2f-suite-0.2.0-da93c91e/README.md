# Tabnas measurement — 20260915T163204958Z-063cd3b35d2f-suite-0.2.0-da93c91e

Generated 2026-09-15T16:32:04.958Z from suite `0.2.0` at commit `da93c91eb1f7b737a87a053715d6d7678a141f7b`.

> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.

## Recorded host

| Field | Value |
| --- | --- |
| Host fingerprint | `063cd3b35d2f` |
| Operating system | `Ubuntu 24.04.4 LTS (linux/amd64)` |
| Kernel | `6.18.44-fc-v33` |
| Processor | `Intel(R) Xeon(R) Processor @ 2.80GHz` |
| Logical CPUs | 4 |
| Memory | 15.72 GiB (16,877,793,280 bytes) |
| Environment fingerprint | `2e786edca5574fb6b21f15751f3479f2a1aba3d072d6f8017da919fd2fb0956a` |

## Ports and runtimes

| Port | Parser | Runtime |
| --- | --- | --- |
| TypeScript / Node.js | `@tabnas/parser@0.9.7` | Node.js v24.21.0 |
| Go | `github.com/tabnas/parser/go@0.9.7` | Go go1.26.0 |
| Rust | `tabnas@0.9.7` | Rust 1.94.1 |

## Adder grammar

Canonical Tabnas integer-addition grammar with semantic accumulation.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go | Rust |
| --- | --- | --- | --- | --- |
| single | `1` | pass `1` | pass `1` | pass `1` |
| chain | `6` | pass `6` | pass `6` | pass `6` |
| multi-digit | `60` | pass `60` | pass `60` | pass `60` |
| trailing-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| leading-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| double-plus | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| unknown-token | reject | pass (rejected) | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative | Rust median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: | ---: |
| terms-8 | 15 | 11,511.28 ns / 86,871 / 5.45× | 7,314.78 ns / 136,709 / 8.58× | 62,725.23 ns / 15,943 / 1.00× |
| terms-64 | 127 | 77,011.08 ns / 12,985 / 3.47× | 49,636.00 ns / 20,147 / 5.38× | 266,980.02 ns / 3,746 / 1.00× |
| terms-512 | 1023 | 625,442.19 ns / 1,599 / 2.96× | 379,707.55 ns / 2,634 / 4.88× | 1,851,950.86 ns / 540 / 1.00× |
| terms-1024 | 2047 | 1,264,280.34 ns / 791 / 2.93× | 785,302.67 ns / 1,273 / 4.71× | 3,698,770.69 ns / 270 / 1.00× |
| terms-2048 | 4095 | 2,367,939.28 ns / 422 / 3.25× | 1,813,255.61 ns / 551 / 4.25× | 7,704,971.75 ns / 130 / 1.00× |
| terms-4096 | 8191 | 4,860,759.94 ns / 206 / 3.34× | 3,666,606.84 ns / 273 / 4.43× | 16,250,503.00 ns / 62 / 1.00× |
| terms-8192 | 16383 | 10,045,623.56 ns / 100 / 3.53× | 8,806,942.50 ns / 114 / 4.03× | 35,486,504.75 ns / 28 / 1.00× |
| terms-16384 | 32767 | 18,365,276.00 ns / 54 / 3.96× | 16,029,689.63 ns / 62 / 4.54× | 72,767,553.00 ns / 14 / 1.00× |

## Even palindromes

Classic non-deterministic context-free language resolved with full parse context.

### Capability matrix

| Case | Expected | TypeScript / Node.js | Go | Rust |
| --- | --- | --- | --- | --- |
| empty | `true` | pass `true` | pass `true` | pass `true` |
| pair-a | `true` | pass `true` | pass `true` | pass `true` |
| pair-b | `true` | pass `true` | pass `true` | pass `true` |
| nested | `true` | pass `true` | pass `true` | pass `true` |
| length-six | `true` | pass `true` | pass `true` | pass `true` |
| odd-length | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| not-mirrored | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| wrong-close | reject | pass (rejected) | pass (rejected) | pass (rejected) |
| outside-alphabet | reject | pass (rejected) | pass (rejected) | pass (rejected) |

### Performance matrix

| Input | Bytes | TypeScript / Node.js median / ops·s⁻¹ / relative | Go median / ops·s⁻¹ / relative | Rust median / ops·s⁻¹ / relative |
| --- | ---: | ---: | ---: | ---: |
| chars-16 | 16 | 12,021.89 ns / 83,182 / 6.46× | 8,656.09 ns / 115,526 / 8.97× | 77,637.23 ns / 12,880 / 1.00× |
| chars-128 | 128 | 81,409.33 ns / 12,284 / 3.89× | 52,175.31 ns / 19,166 / 6.07× | 316,418.18 ns / 3,160 / 1.00× |
| chars-1024 | 1024 | 648,111.46 ns / 1,543 / 3.37× | 453,635.50 ns / 2,204 / 4.82× | 2,186,280.95 ns / 457 / 1.00× |
| chars-2048 | 2048 | 1,748,858.72 ns / 572 / 2.59× | 971,926.23 ns / 1,029 / 4.66× | 4,525,796.50 ns / 221 / 1.00× |
| chars-4096 | 4096 | 3,438,106.25 ns / 291 / 2.95× | 2,220,087.11 ns / 450 / 4.57× | 10,140,290.38 ns / 99 / 1.00× |
| chars-8192 | 8192 | 7,036,824.06 ns / 142 / 3.23× | 4,939,558.84 ns / 202 / 4.60× | 22,727,832.00 ns / 44 / 1.00× |
| chars-16384 | 16384 | 14,629,224.38 ns / 68 / 3.43× | 8,779,603.69 ns / 114 / 5.71× | 50,136,272.50 ns / 20 / 1.00× |
| chars-32768 | 32768 | 28,531,570.50 ns / 35 / 3.60× | 16,312,432.25 ns / 61 / 6.30× | 102,768,874.00 ns / 10 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
