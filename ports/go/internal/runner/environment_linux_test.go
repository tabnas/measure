//go:build linux

package runner

import (
	"strings"
	"testing"
)

func TestCPUModelFrom(t *testing.T) {
	for _, test := range []struct {
		name, input, want string
	}{
		{"lscpu arm", "Architecture: aarch64\nModel name: Neoverse-N1\n", "Neoverse-N1"},
		{"proc x86", "processor : 0\nmodel name : Intel(R) Xeon(R)\n", "Intel(R) Xeon(R)"},
		{"missing", "Architecture: aarch64\n", ""},
	} {
		t.Run(test.name, func(t *testing.T) {
			if got := cpuModelFrom(strings.NewReader(test.input)); got != test.want {
				t.Fatalf("cpuModelFrom() = %q; want %q", got, test.want)
			}
		})
	}
}
