import { Tabnas, type Context, type Rule } from '@tabnas/parser'

import type { ParserAdapter } from './model.js'

export function makeParser(benchmarkId: string): ParserAdapter {
  switch (benchmarkId) {
    case 'adder':
      return makeAdder()
    case 'palindrome':
      return makePalindrome()
    default:
      throw new Error(`No TypeScript parser implementation for benchmark ${benchmarkId}`)
  }
}

function makeAdder(): ParserAdapter {
  const parser = new Tabnas({
    fixed: { token: { '#PL': '+' } },
    rule: { start: 'val' },
  })

  parser.rule('val', (spec) =>
    spec
      .open([{ p: 'add', a: (rule: Rule) => (rule.node = 0) }])
      .close([{ s: '#ZZ' }]),
  )

  parser.rule('add', (spec) =>
    spec
      .open([
        {
          s: '#NR',
          a: (rule: Rule) => {
            rule.parent.node = Number(rule.parent.node) + Number(rule.o[0]?.val)
          },
        },
      ])
      .close([{ s: '#PL', r: 'add' }, {}]),
  )

  return parser
}

function makePalindrome(): ParserAdapter {
  const parser = new Tabnas({
    fixed: { token: { '#A': 'a', '#B': 'b' } },
    lex: { emptyResult: true, match: {} },
    rule: { start: 'val' },
  })

  parser.rule('val', (spec) =>
    spec
      .open([{ p: 'pal', a: (rule: Rule) => (rule.node = true) }])
      .close([{ s: '#ZZ' }]),
  )

  const beforeMidpoint = (_rule: Rule, context: Context) =>
    context.vAbs * 2 < context.src().length
  const atMidpoint = (_rule: Rule, context: Context) =>
    context.vAbs * 2 === context.src().length

  parser.rule('pal', (spec) =>
    spec
      .open([
        {
          s: '#A',
          c: beforeMidpoint,
          p: 'pal',
          a: (rule: Rule) => (rule.u.expected = 'a'),
        },
        {
          s: '#B',
          c: beforeMidpoint,
          p: 'pal',
          a: (rule: Rule) => (rule.u.expected = 'b'),
        },
        {
          c: atMidpoint,
          a: (rule: Rule) => (rule.u.midpoint = true),
        },
      ])
      .close([
        { s: '#A', c: (rule: Rule) => rule.u.expected === 'a' },
        { s: '#B', c: (rule: Rule) => rule.u.expected === 'b' },
        { c: (rule: Rule) => rule.u.midpoint === true },
      ]),
  )

  return parser
}
