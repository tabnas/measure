# Tabnas measurement — 20260915T180252380Z-063cd3b35d2f-suite-0.2.0-05a88620

Generated 2026-09-15T18:02:52.380Z from suite `0.2.0` at commit `05a886202b44a674550abd9cfa7f18a466bd8d94`.

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
| terms-8 | 15 | 11,490.67 ns / 87,027 / 2.52× | 8,091.92 ns / 123,580 / 3.57× | 28,896.33 ns / 34,606 / 1.00× |
| terms-64 | 127 | 76,388.12 ns / 13,091 / 2.91× | 46,106.30 ns / 21,689 / 4.82× | 222,073.14 ns / 4,503 / 1.00× |
| terms-512 | 1023 | 638,741.75 ns / 1,566 / 2.56× | 356,483.82 ns / 2,805 / 4.58× | 1,634,044.25 ns / 612 / 1.00× |
| terms-1024 | 2047 | 1,314,729.44 ns / 761 / 2.54× | 722,471.04 ns / 1,384 / 4.63× | 3,341,298.28 ns / 299 / 1.00× |
| terms-2048 | 4095 | 2,537,884.00 ns / 394 / 2.79× | 1,642,701.08 ns / 609 / 4.31× | 7,080,599.44 ns / 141 / 1.00× |
| terms-4096 | 8191 | 5,191,924.41 ns / 193 / 2.75× | 3,291,625.59 ns / 304 / 4.34× | 14,283,724.63 ns / 70 / 1.00× |
| terms-8192 | 16383 | 9,956,117.69 ns / 100 / 3.12× | 8,149,440.25 ns / 123 / 3.81× | 31,083,210.00 ns / 32 / 1.00× |
| terms-16384 | 32767 | 18,251,306.13 ns / 55 / 3.56× | 15,469,778.63 ns / 65 / 4.21× | 65,051,246.50 ns / 15 / 1.00× |

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
| chars-16 | 16 | 11,759.63 ns / 85,037 / 3.20× | 8,935.10 ns / 111,918 / 4.21× | 37,621.95 ns / 26,580 / 1.00× |
| chars-128 | 128 | 76,007.32 ns / 13,157 / 3.41× | 51,361.52 ns / 19,470 / 5.04× | 258,932.00 ns / 3,862 / 1.00× |
| chars-1024 | 1024 | 594,191.75 ns / 1,683 / 3.39× | 438,504.58 ns / 2,280 / 4.60× | 2,016,005.45 ns / 496 / 1.00× |
| chars-2048 | 2048 | 1,147,558.05 ns / 871 / 3.55× | 875,533.02 ns / 1,142 / 4.66× | 4,078,753.72 ns / 245 / 1.00× |
| chars-4096 | 4096 | 2,292,224.28 ns / 436 / 3.76× | 2,225,446.86 ns / 449 / 3.87× | 8,607,803.88 ns / 116 / 1.00× |
| chars-8192 | 8192 | 4,577,692.09 ns / 218 / 4.19× | 5,681,125.63 ns / 176 / 3.37× | 19,163,533.75 ns / 52 / 1.00× |
| chars-16384 | 16384 | 9,303,471.31 ns / 107 / 4.72× | 10,101,483.50 ns / 99 / 4.35× | 43,951,776.00 ns / 23 / 1.00× |
| chars-32768 | 32768 | 19,903,104.88 ns / 50 / 4.77× | 17,962,057.00 ns / 56 / 5.29× | 95,021,407.00 ns / 11 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
