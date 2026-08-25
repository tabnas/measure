//go:build !darwin && !linux

package runner

import "runtime"

func cpuModel() string {
	return runtime.GOARCH
}

func totalMemoryBytes() uint64 {
	return 1
}
