//go:build darwin

package runner

import (
	"encoding/binary"
	"runtime"
	"strings"
	"syscall"
)

func cpuModel() string {
	model, err := syscall.Sysctl("machdep.cpu.brand_string")
	if err != nil || strings.TrimSpace(model) == "" {
		return runtime.GOARCH
	}
	return strings.TrimSpace(model)
}

func totalMemoryBytes() uint64 {
	value, err := syscall.Sysctl("hw.memsize")
	if err != nil || len(value) == 0 || len(value) > 8 {
		return 1
	}
	// syscall.Sysctl treats every value as a C string and removes one final
	// NUL byte. hw.memsize is a binary uint64, so restore that byte before
	// decoding values whose most-significant byte is zero.
	var bytes [8]byte
	copy(bytes[:], value)
	return binary.LittleEndian.Uint64(bytes[:])
}
