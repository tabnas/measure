//go:build linux

package runner

import (
	"bufio"
	"bytes"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

func cpuModel() string {
	if output, err := exec.Command("lscpu").Output(); err == nil {
		if model := cpuModelFrom(bytes.NewReader(output)); model != "" {
			return model
		}
	}
	file, err := os.Open("/proc/cpuinfo")
	if err != nil {
		return runtime.GOARCH
	}
	defer file.Close()
	if model := cpuModelFrom(file); model != "" {
		return model
	}
	return runtime.GOARCH
}

func cpuModelFrom(input interface{ Read([]byte) (int, error) }) string {
	scanner := bufio.NewScanner(input)
	for scanner.Scan() {
		key, value, found := strings.Cut(scanner.Text(), ":")
		if found && strings.EqualFold(strings.TrimSpace(key), "model name") {
			return strings.TrimSpace(value)
		}
	}
	return ""
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
