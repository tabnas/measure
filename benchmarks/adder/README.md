# Adder benchmark

This is the canonical Tabnas addition grammar:

```abnf
val = add
add = NR [ PL add ]
PL = "+"
```

The benchmark uses equivalent programmatic rule tables in both ports so parser
execution—not an ABNF compiler—is timed. Each `#NR` action adds its numeric
value to the `val` node, and the close-state repeat consumes `#PL` before the
next term.

Performance inputs contain `N` integer terms, all `1`, separated by `+`. The
semantic result is therefore `N`, which is folded into the runner checksum.

The timing scope is steady-state parse only. Parser construction and grammar
installation are excluded.

## Why the performance sizes match the palindrome benchmark

`adder` runs the same byte sizes as `palindrome` (`terms-n` generates `2n-1`
bytes) so it can serve as the control for a scaling question that benchmark
raised: the Go port grows superlinearly there past 1024 characters, costing
more per byte as input grows, while TypeScript stays linear.

A grammar-independent cause — allocator behaviour, a cache level, GC — would
bend both curves at the same byte size. A cause specific to the palindrome
rules would bend only that one. Holding the sizes equal is what makes the two
readings distinguishable, so these rows are worth keeping in step even though
this grammar is the simpler one.
