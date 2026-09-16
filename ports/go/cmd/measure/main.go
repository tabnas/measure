package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

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
	deterministic := flag.String("deterministic", "", "parse one <benchmark>/<case> a fixed number of times with no clock")
	iterations := flag.Int("iterations", -1, "how many parses the deterministic mode performs")
	flag.Parse()

	// The deterministic mode wants the config and the benchmarks and
	// nothing that names a run: it is one case parsed a fixed number of
	// times, and the document it prints identifies the case, not the run.
	if *deterministic != "" {
		benchmarkID, caseID, found := strings.Cut(*deterministic, "/")
		if !found || *config == "" || *benchmarks == "" || *iterations < 0 {
			fmt.Fprintln(os.Stderr, "deterministic mode needs -config, -benchmarks, -deterministic <benchmark>/<case> and -iterations")
			flag.Usage()
			os.Exit(2)
		}
		result, err := runner.RunDeterministic(runner.DeterministicArguments{
			Config: *config, Benchmarks: *benchmarks,
			BenchmarkID: benchmarkID, CaseID: caseID, Iterations: *iterations,
		})
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		emit(result)
		return
	}

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
	emit(result)
}

func emit(result any) {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(result); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
