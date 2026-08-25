//go:build darwin

package runner

import (
	"runtime"
	"testing"
)

func TestDarwinHostDetails(t *testing.T) {
	if model := cpuModel(); model == "" || model == runtime.GOARCH {
		t.Fatalf("cpuModel() = %q; want the macOS CPU brand", model)
	}
	if memory := totalMemoryBytes(); memory <= 1 {
		t.Fatalf("totalMemoryBytes() = %d; want physical memory from hw.memsize", memory)
	}
}
