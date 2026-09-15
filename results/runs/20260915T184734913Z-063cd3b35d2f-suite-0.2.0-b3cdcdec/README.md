# Tabnas measurement — 20260915T184734913Z-063cd3b35d2f-suite-0.2.0-b3cdcdec

Generated 2026-09-15T18:47:34.913Z from suite `0.2.0` at commit `b3cdcdecf93ef7d186842cfd0ceb81f4ff6e3f97`.

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
| terms-8 | 15 | 11,479.11 ns / 87,115 / 1.95× | 7,085.86 ns / 141,126 / 3.16× | 22,397.09 ns / 44,649 / 1.00× |
| terms-64 | 127 | 74,514.03 ns / 13,420 / 2.18× | 44,624.69 ns / 22,409 / 3.65× | 162,647.74 ns / 6,148 / 1.00× |
| terms-512 | 1023 | 571,716.39 ns / 1,749 / 2.42× | 352,966.57 ns / 2,833 / 3.93× | 1,385,936.44 ns / 722 / 1.00× |
| terms-1024 | 2047 | 1,196,449.12 ns / 836 / 2.32× | 736,701.04 ns / 1,357 / 3.77× | 2,778,587.08 ns / 360 / 1.00× |
| terms-2048 | 4095 | 2,393,188.92 ns / 418 / 2.35× | 1,637,899.98 ns / 611 / 3.43× | 5,621,546.50 ns / 178 / 1.00× |
| terms-4096 | 8191 | 4,746,269.66 ns / 211 / 2.45× | 3,187,113.06 ns / 314 / 3.64× | 11,615,199.44 ns / 86 / 1.00× |
| terms-8192 | 16383 | 9,053,276.13 ns / 110 / 2.63× | 7,694,173.31 ns / 130 / 3.09× | 23,796,402.38 ns / 42 / 1.00× |
| terms-16384 | 32767 | 18,753,351.38 ns / 53 / 2.54× | 15,077,331.13 ns / 66 / 3.16× | 47,706,054.50 ns / 21 / 1.00× |

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
| chars-16 | 16 | 11,908.38 ns / 83,974 / 2.23× | 8,249.86 ns / 121,214 / 3.21× | 26,501.89 ns / 37,733 / 1.00× |
| chars-128 | 128 | 76,299.69 ns / 13,106 / 2.35× | 50,028.11 ns / 19,989 / 3.58× | 179,183.13 ns / 5,581 / 1.00× |
| chars-1024 | 1024 | 601,382.19 ns / 1,663 / 2.47× | 457,867.73 ns / 2,184 / 3.25× | 1,485,922.77 ns / 673 / 1.00× |
| chars-2048 | 2048 | 1,130,353.59 ns / 885 / 2.69× | 880,107.74 ns / 1,136 / 3.45× | 3,034,845.25 ns / 330 / 1.00× |
| chars-4096 | 4096 | 2,298,876.66 ns / 435 / 2.78× | 2,194,263.92 ns / 456 / 2.92× | 6,395,266.38 ns / 156 / 1.00× |
| chars-8192 | 8192 | 4,690,171.81 ns / 213 / 3.10× | 4,853,815.66 ns / 206 / 3.00× | 14,560,082.38 ns / 69 / 1.00× |
| chars-16384 | 16384 | 9,303,103.94 ns / 107 / 3.34× | 8,761,314.06 ns / 114 / 3.55× | 31,083,879.75 ns / 32 / 1.00× |
| chars-32768 | 32768 | 19,459,423.25 ns / 51 / 3.09× | 16,939,057.00 ns / 59 / 3.55× | 60,054,092.00 ns / 17 / 1.00× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)
- [Rust raw samples](raw/rust.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
