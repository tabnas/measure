# Tabnas measurement — 20260915T151623282Z-063cd3b35d2f-suite-0.2.0-51ffdf1d

Generated 2026-09-15T15:16:23.282Z from suite `0.2.0` at commit `51ffdf1d49a86d02a749926e9fa9a0bda0764887`.

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
| terms-8 | 15 | 11,768.33 ns / 84,974 / 5.89× | 7,584.63 ns / 131,846 / 9.14× | 69,336.84 ns / 14,422 / 1.00× |
| terms-64 | 127 | 73,444.05 ns / 13,616 / 4.11× | 49,169.87 ns / 20,338 / 6.14× | 301,699.98 ns / 3,315 / 1.00× |
| terms-512 | 1023 | 580,333.18 ns / 1,723 / 3.64× | 394,105.76 ns / 2,537 / 5.35× | 2,109,470.67 ns / 474 / 1.00× |
| terms-1024 | 2047 | 1,287,700.06 ns / 777 / 3.29× | 743,638.77 ns / 1,345 / 5.71× | 4,242,104.72 ns / 236 / 1.00× |
| terms-2048 | 4095 | 2,353,135.27 ns / 425 / 3.77× | 1,680,564.43 ns / 595 / 5.28× | 8,875,077.69 ns / 113 / 1.00× |
| terms-4096 | 8191 | 4,762,321.03 ns / 210 / 3.80× | 3,415,638.94 ns / 293 / 5.30× | 18,087,695.00 ns / 55 / 1.00× |
| terms-8192 | 16383 | 9,828,823.81 ns / 102 / 3.94× | 8,455,017.88 ns / 118 / 4.58× | 38,716,384.50 ns / 26 / 1.00× |
| terms-16384 | 32767 | 18,161,693.63 ns / 55 / 4.50× | 16,849,806.38 ns / 59 / 4.85× | 81,775,248.50 ns / 12 / 1.00× |

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
| chars-16 | 16 | 11,807.28 ns / 84,694 / 7.92× | 9,290.25 ns / 107,640 / 10.07× | 93,518.61 ns / 10,693 / 1.00× |
| chars-128 | 128 | 76,438.88 ns / 13,082 / 5.32× | 53,577.72 ns / 18,664 / 7.59× | 406,471.96 ns / 2,460 / 1.00× |
| chars-1024 | 1024 | 600,420.61 ns / 1,665 / 4.84× | 416,201.63 ns / 2,403 / 6.98× | 2,905,700.27 ns / 344 / 1.00× |
| chars-2048 | 2048 | 1,234,097.02 ns / 810 / 4.92× | 903,990.72 ns / 1,106 / 6.72× | 6,072,996.50 ns / 165 / 1.00× |
| chars-4096 | 4096 | 2,460,756.91 ns / 406 / 5.10× | 2,545,240.38 ns / 393 / 4.93× | 12,558,056.88 ns / 80 / 1.00× |
| chars-8192 | 8192 | 4,899,976.94 ns / 204 / 6.04× | 5,548,796.22 ns / 180 / 5.33× | 29,593,337.50 ns / 34 / 1.00× |
| chars-16384 | 16384 | 9,967,976.63 ns / 100 / 6.63× | 10,078,466.69 ns / 99 / 6.56× | 66,115,349.50 ns / 15 / 1.00× |
| chars-32768 | 32768 | 20,343,949.38 ns / 49 / 6.60× | 18,411,111.13 ns / 54 / 7.29× | 134,233,641.00 ns / 7 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
