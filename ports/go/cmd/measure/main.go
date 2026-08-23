package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/tabnas/measure/ports/go/internal/runner"
)

func main() {
	config := flag.String("config", "", "path to measure.config.json")
	benchmarks := flag.String("benchmarks", "", "path to canonical benchmark manifests")
	profile := flag.String("profile", "", "measurement profile")
	runID := flag.String("run-id", "", "immutable run identifier")
	generatedAt := flag.String("generated-at", "", "ISO-8601 generation time")
	commit := flag.String("commit", "", "repository commit")
	dirty := flag.Bool("dirty", false, "whether the source tree was dirty")
	hostFingerprint := flag.String("host-fingerprint", "", "short pseudonymous measurement host fingerprint")
	flag.Parse()

	if *config == "" || *benchmarks == "" || *profile == "" || *runID == "" || *generatedAt == "" || *commit == "" || *hostFingerprint == "" {
		fmt.Fprintln(os.Stderr, "all runner arguments are required")
		flag.Usage()
		os.Exit(2)
	}

	result, err := runner.Run(runner.Arguments{
		Config: *config, Benchmarks: *benchmarks, Profile: *profile, RunID: *runID,
		GeneratedAt: *generatedAt, Commit: *commit, Dirty: *dirty,
		HostFingerprint: *hostFingerprint,
	})
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	encoder.SetEscapeHTML(false)
	if err = encoder.Encode(result); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
