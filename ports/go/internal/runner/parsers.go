package runner

import (
	"fmt"

	tabnas "github.com/tabnas/parser/go"
)

type parserAdapter interface {
	Parse(string) (any, error)
}

func makeParser(benchmarkID string) (parserAdapter, error) {
	switch benchmarkID {
	case "adder":
		return makeAdder(), nil
	case "palindrome":
		return makePalindrome(), nil
	default:
		return nil, fmt.Errorf("no Go parser implementation for benchmark %s", benchmarkID)
	}
}

func makeAdder() *tabnas.Tabnas {
	plus := "+"
	parser := tabnas.Make(tabnas.Options{
		Fixed: &tabnas.FixedOptions{Token: map[string]*string{"#PL": &plus}},
		Rule:  &tabnas.RuleOptions{Start: "val"},
	})

	plusToken := parser.Token("#PL")
	parser.Rule("val", func(spec *tabnas.RuleSpec, _ *tabnas.Parser) {
		spec.AddOpen(&tabnas.AltSpec{
			P: "add",
			A: func(rule *tabnas.Rule, _ *tabnas.Context) { rule.Node = float64(0) },
		})
		spec.AddClose(&tabnas.AltSpec{S: [][]tabnas.Tin{{tabnas.TinZZ}}})
	})

	parser.Rule("add", func(spec *tabnas.RuleSpec, _ *tabnas.Parser) {
		spec.AddOpen(&tabnas.AltSpec{
			S: [][]tabnas.Tin{{tabnas.TinNR}},
			A: func(rule *tabnas.Rule, _ *tabnas.Context) {
				left, _ := rule.Parent.Node.(float64)
				right, _ := rule.O[0].Val.(float64)
				rule.Parent.Node = left + right
			},
		})
		spec.AddClose(
			&tabnas.AltSpec{S: [][]tabnas.Tin{{plusToken}}, R: "add"},
			&tabnas.AltSpec{},
		)
	})

	return parser
}

func makePalindrome() *tabnas.Tabnas {
	aSource, bSource := "a", "b"
	parser := tabnas.Make(tabnas.Options{
		Fixed: &tabnas.FixedOptions{Token: map[string]*string{
			"#A": &aSource,
			"#B": &bSource,
		}},
		Lex:  &tabnas.LexOptions{EmptyResult: true},
		Rule: &tabnas.RuleOptions{Start: "val"},
	})

	aToken, bToken := parser.Token("#A"), parser.Token("#B")
	parser.Rule("val", func(spec *tabnas.RuleSpec, _ *tabnas.Parser) {
		spec.AddOpen(&tabnas.AltSpec{
			P: "pal",
			A: func(rule *tabnas.Rule, _ *tabnas.Context) { rule.Node = true },
		})
		spec.AddClose(&tabnas.AltSpec{S: [][]tabnas.Tin{{tabnas.TinZZ}}})
	})

	beforeMidpoint := func(_ *tabnas.Rule, context *tabnas.Context) bool {
		return context.VAbs*2 < len(context.Src)
	}
	atMidpoint := func(_ *tabnas.Rule, context *tabnas.Context) bool {
		return context.VAbs*2 == len(context.Src)
	}
	parser.Rule("pal", func(spec *tabnas.RuleSpec, _ *tabnas.Parser) {
		spec.AddOpen(
			&tabnas.AltSpec{
				S: [][]tabnas.Tin{{aToken}}, C: beforeMidpoint, P: "pal",
				A: func(rule *tabnas.Rule, _ *tabnas.Context) { rule.EnsureU()["expected"] = "a" },
			},
			&tabnas.AltSpec{
				S: [][]tabnas.Tin{{bToken}}, C: beforeMidpoint, P: "pal",
				A: func(rule *tabnas.Rule, _ *tabnas.Context) { rule.EnsureU()["expected"] = "b" },
			},
			&tabnas.AltSpec{
				C: atMidpoint,
				A: func(rule *tabnas.Rule, _ *tabnas.Context) { rule.EnsureU()["midpoint"] = true },
			},
		)
		spec.AddClose(
			&tabnas.AltSpec{S: [][]tabnas.Tin{{aToken}}, C: func(rule *tabnas.Rule, _ *tabnas.Context) bool {
				return rule.U["expected"] == "a"
			}},
			&tabnas.AltSpec{S: [][]tabnas.Tin{{bToken}}, C: func(rule *tabnas.Rule, _ *tabnas.Context) bool {
				return rule.U["expected"] == "b"
			}},
			&tabnas.AltSpec{C: func(rule *tabnas.Rule, _ *tabnas.Context) bool {
				return rule.U["midpoint"] == true
			}},
		)
	})

	return parser
}
