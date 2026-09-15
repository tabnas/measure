# Tabnas measurement — 20260915T132126947Z-063cd3b35d2f-suite-0.2.0-a9c67968

Generated 2026-09-15T13:21:26.947Z from suite `0.2.0` at commit `a9c679687bd991a2a34f1849aaf96153dabd41d3`.

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
| TypeScript / Node.js | `@tabnas/parser@0.9.0` | Node.js v24.21.0 |
| Go | `github.com/tabnas/parser/go@0.9.0` | Go go1.26.0 |

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
| terms-8 | 15 | 10,851.72 ns / 92,151 / 1.00× | 7,655.39 ns / 130,627 / 1.42× |
| terms-64 | 127 | 73,378.37 ns / 13,628 / 1.00× | 45,322.39 ns / 22,064 / 1.62× |
| terms-512 | 1023 | 591,170.32 ns / 1,692 / 1.00× | 358,813.01 ns / 2,787 / 1.65× |
| terms-1024 | 2047 | 1,216,691.13 ns / 822 / 1.00× | 715,942.13 ns / 1,397 / 1.70× |
| terms-2048 | 4095 | 2,301,381.11 ns / 435 / 1.00× | 1,715,655.00 ns / 583 / 1.34× |
| terms-4096 | 8191 | 4,793,117.88 ns / 209 / 1.00× | 3,285,402.22 ns / 304 / 1.46× |
| terms-8192 | 16383 | 9,642,777.50 ns / 104 / 1.00× | 8,475,942.00 ns / 118 / 1.14× |
| terms-16384 | 32767 | 18,019,471.50 ns / 55 / 1.00× | 15,355,670.63 ns / 65 / 1.17× |

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
| chars-16 | 16 | 11,984.35 ns / 83,442 / 1.00× | 9,442.05 ns / 105,909 / 1.27× |
| chars-128 | 128 | 76,534.82 ns / 13,066 / 1.00× | 60,522.32 ns / 16,523 / 1.27× |
| chars-1024 | 1024 | 613,530.88 ns / 1,630 / 1.00× | 461,789.43 ns / 2,165 / 1.33× |
| chars-2048 | 2048 | 1,110,848.47 ns / 900 / 1.00× | 849,072.90 ns / 1,178 / 1.31× |
| chars-4096 | 4096 | 2,238,647.14 ns / 447 / 1.00× | 2,145,363.88 ns / 466 / 1.04× |
| chars-8192 | 8192 | 4,649,404.03 ns / 215 / 1.08× | 5,030,579.63 ns / 199 / 1.00× |
| chars-16384 | 16384 | 9,516,814.19 ns / 105 / 1.07× | 10,191,867.88 ns / 98 / 1.00× |
| chars-32768 | 32768 | 20,313,272.25 ns / 49 / 1.00× | 18,125,885.38 ns / 55 / 1.12× |

## Raw evidence

- [TypeScript / Node.js raw samples](raw/typescript.json)
- [Go raw samples](raw/go.json)

Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).
