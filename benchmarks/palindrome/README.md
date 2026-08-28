# Even-palindrome benchmark

The language is the classic academic example

```text
L = { wwᴿ | w ∈ {a,b}* }
S → aSa | bSb | ε
```

Even palindromes are context-free but not deterministic context-free. A
pushdown automaton reading left to right has no separator telling it when to
stop pushing and begin matching; a nondeterministic machine guesses the
midpoint. By contrast, `{w#wᴿ}` is deterministic because `#` supplies that
boundary.

This benchmark deliberately keeps Tabnas's rule execution deterministic. Its
alternate condition can inspect the full source and consumed-token count, so it
selects the empty production exactly at `length / 2`. The close phase then
matches each opening symbol on the way back up the rule stack. It demonstrates
that deterministic dispatch is not a deterministic-context-free language
ceiling once matchers and conditions have complete parse context.

The capability matrix includes valid, invalid, odd-length, and invalid-alphabet
inputs. Performance inputs repeat a fixed `abba` seed to form `w`, then append
`reverse(w)`. Parser construction is excluded from timings.

## Why the performance sizes are shaped this way

The sizes double from 1024 (`1024, 2048, 4096, 8192, 16384, 32768`) because
the curve, not any single point, is the measurement.

Three recorded runs on one host showed the Go port costing 11.7-12.8x for 8x
more input over 1024 -> 8192, where the TypeScript port cost 8.0-8.1x. Growth
faster than the input is superlinear: the per-byte cost rises as inputs grow,
so the port is not merely slower at scale, it degrades at scale. It was enough
to erase Go's ~1.6x lead at every smaller size.

Two points 8x apart cannot say WHY. Smooth superlinear work and ordinary
linear work plus a one-off cliff — a reallocation, a cache level, a GC
threshold — produce the same ratio across a gap that wide. They call for
different fixes, so the gap is now filled in: doubling steps show whether cost
per byte climbs steadily or jumps once and resumes climbing linearly, and the
two sizes past the old 8192 ceiling show whether it continues or settles.

`adder` carries the same byte sizes deliberately. It is the control: if a size
is expensive there too, the cause is input size, and if only the palindrome
rows bend, the cause is this grammar — most likely the midpoint condition,
which is the one part of this benchmark that inspects the whole source.

Academic reference: [Context-free recognition summary](https://www.cs.utahtech.edu/cs/3530/examples.examples/chapter02-contextfreelanguages.pdf).
