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

Academic reference: [Context-free recognition summary](https://www.cs.utahtech.edu/cs/3530/examples.examples/chapter02-contextfreelanguages.pdf).
