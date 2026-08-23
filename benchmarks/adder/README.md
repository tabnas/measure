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
