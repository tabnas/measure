# Tabnas measurement — 20260915T212126054Z-063cd3b35d2f-suite-0.2.0-27877fae

Generated 2026-09-15T21:21:26.054Z from suite `0.2.0` at commit `27877fae077d3452b243d092faaa9aad4bd2eeeb`.

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
| TypeScript / Node.js | `@tabnas/parser@0.9.7` | Node.js v22.22.2 |
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
| terms-8 | 15 | 10,410.64 ns / 96,056 / 1.64× | 7,693.55 ns / 129,979 / 2.22× | 17,080.77 ns / 58,545 / 1.00× |
| terms-64 | 127 | 81,840.11 ns / 12,219 / 1.53× | 47,686.65 ns / 20,970 / 2.62× | 124,772.05 ns / 8,015 / 1.00× |
| terms-512 | 1023 | 578,247.06 ns / 1,729 / 1.75× | 385,504.96 ns / 2,594 / 2.62× | 1,011,307.28 ns / 989 / 1.00× |
| terms-1024 | 2047 | 1,294,451.39 ns / 773 / 1.56× | 733,744.36 ns / 1,363 / 2.75× | 2,015,464.06 ns / 496 / 1.00× |
| terms-2048 | 4095 | 2,535,335.06 ns / 394 / 1.61× | 1,680,576.58 ns / 595 / 2.43× | 4,088,288.44 ns / 245 / 1.00× |
| terms-4096 | 8191 | 5,544,093.75 ns / 180 / 1.51× | 3,186,611.09 ns / 314 / 2.63× | 8,366,843.50 ns / 120 / 1.00× |
| terms-8192 | 16383 | 12,859,140.75 ns / 78 / 1.37× | 7,856,470.81 ns / 127 / 2.24× | 17,556,252.75 ns / 57 / 1.00× |
| terms-16384 | 32767 | 37,784,845.25 ns / 26 / 1.00× | 15,651,818.25 ns / 64 / 2.41× | 35,763,307.25 ns / 28 / 1.06× |

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
| chars-16 | 16 | 11,680.88 ns / 85,610 / 1.85× | 8,225.61 ns / 121,572 / 2.63× | 21,662.06 ns / 46,164 / 1.00× |
| chars-128 | 128 | 73,064.96 ns / 13,686 / 1.99× | 51,392.40 ns / 19,458 / 2.83× | 145,535.83 ns / 6,871 / 1.00× |
| chars-1024 | 1024 | 610,878.39 ns / 1,637 / 1.97× | 409,614.45 ns / 2,441 / 2.94× | 1,204,593.13 ns / 830 / 1.00× |
| chars-2048 | 2048 | 1,161,692.68 ns / 861 / 2.10× | 918,724.85 ns / 1,088 / 2.66× | 2,443,014.03 ns / 409 / 1.00× |
| chars-4096 | 4096 | 2,354,326.97 ns / 425 / 2.12× | 2,525,521.42 ns / 396 / 1.97× | 4,980,095.25 ns / 201 / 1.00× |
| chars-8192 | 8192 | 4,975,138.63 ns / 201 / 2.32× | 5,544,519.97 ns / 180 / 2.08× | 11,526,119.94 ns / 87 / 1.00× |
| chars-16384 | 16384 | 11,381,494.19 ns / 88 / 2.10× | 9,435,803.06 ns / 106 / 2.53× | 23,842,761.75 ns / 42 / 1.00× |
| chars-32768 | 32768 | 34,665,306.25 ns / 29 / 1.46× | 18,620,612.75 ns / 54 / 2.72× | 50,549,168.25 ns / 20 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
