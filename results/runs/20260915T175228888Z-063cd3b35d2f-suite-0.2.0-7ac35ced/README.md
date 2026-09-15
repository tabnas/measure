# Tabnas measurement — 20260915T175228888Z-063cd3b35d2f-suite-0.2.0-7ac35ced

Generated 2026-09-15T17:52:28.888Z from suite `0.2.0` at commit `7ac35ced61f41be49b194123f58a4e62c1b079ca`.

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
| terms-8 | 15 | 11,261.14 ns / 88,801 / 2.88× | 7,069.46 ns / 141,453 / 4.59× | 32,437.64 ns / 30,828 / 1.00× |
| terms-64 | 127 | 79,272.17 ns / 12,615 / 2.85× | 44,303.78 ns / 22,571 / 5.10× | 225,734.24 ns / 4,430 / 1.00× |
| terms-512 | 1023 | 589,324.73 ns / 1,697 / 2.90× | 350,160.61 ns / 2,856 / 4.87× | 1,706,704.38 ns / 586 / 1.00× |
| terms-1024 | 2047 | 1,180,844.34 ns / 847 / 2.92× | 774,744.30 ns / 1,291 / 4.45× | 3,444,148.44 ns / 290 / 1.00× |
| terms-2048 | 4095 | 2,597,712.45 ns / 385 / 2.77× | 1,681,019.69 ns / 595 / 4.28× | 7,191,557.81 ns / 139 / 1.00× |
| terms-4096 | 8191 | 4,654,962.16 ns / 215 / 3.05× | 3,309,294.00 ns / 302 / 4.29× | 14,185,197.63 ns / 70 / 1.00× |
| terms-8192 | 16383 | 9,263,984.56 ns / 108 / 3.38× | 8,039,177.00 ns / 124 / 3.89× | 31,267,530.00 ns / 32 / 1.00× |
| terms-16384 | 32767 | 19,411,952.75 ns / 52 / 3.37× | 15,164,679.75 ns / 66 / 4.32× | 65,454,680.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 12,143.43 ns / 82,349 / 3.58× | 8,988.91 ns / 111,248 / 4.84× | 43,520.19 ns / 22,978 / 1.00× |
| chars-128 | 128 | 77,070.70 ns / 12,975 / 3.55× | 54,973.84 ns / 18,190 / 4.97× | 273,198.39 ns / 3,660 / 1.00× |
| chars-1024 | 1024 | 613,415.75 ns / 1,630 / 3.34× | 450,746.55 ns / 2,219 / 4.54× | 2,045,932.14 ns / 489 / 1.00× |
| chars-2048 | 2048 | 1,146,359.02 ns / 872 / 3.63× | 891,580.79 ns / 1,122 / 4.66× | 4,157,229.81 ns / 241 / 1.00× |
| chars-4096 | 4096 | 2,341,338.52 ns / 427 / 3.75× | 2,151,840.34 ns / 465 / 4.08× | 8,767,881.25 ns / 114 / 1.00× |
| chars-8192 | 8192 | 4,686,575.03 ns / 213 / 4.11× | 4,740,637.91 ns / 211 / 4.06× | 19,244,834.75 ns / 52 / 1.00× |
| chars-16384 | 16384 | 9,253,059.44 ns / 108 / 4.80× | 8,506,847.00 ns / 118 / 5.22× | 44,372,909.25 ns / 23 / 1.00× |
| chars-32768 | 32768 | 20,455,982.50 ns / 49 / 4.65× | 17,887,222.25 ns / 56 / 5.32× | 95,083,604.00 ns / 11 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
