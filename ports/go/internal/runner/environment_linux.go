//go:build linux

package runner

import (
	"bufio"
	"os"
	"runtime"
	"strconv"
	"strings"
)

func cpuModel() string {
	file, err := os.Open("/proc/cpuinfo")
	if err != nil {
		return runtime.GOARCH
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		key, value, found := strings.Cut(scanner.Text(), ":")
		if found && strings.TrimSpace(key) == "model name" {
			return strings.TrimSpace(value)
		}
	}
	return runtime.GOARCH
}

func totalMemoryBytes() uint64 {
	file, err := os.Open("/proc/meminfo")
	if err != nil {
		return 1
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) >= 2 && fields[0] == "MemTotal:" {
			kilobytes, parseErr := strconv.ParseUint(fields[1], 10, 64)
			if parseErr == nil {
				return kilobytes * 1024
			}
		}
	}
	return 1
}
