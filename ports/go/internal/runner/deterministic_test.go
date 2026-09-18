package runner

import (
	"path/filepath"
	"runtime"
	"runtime/debug"
	"testing"
)

// The repository's own benchmark manifests, which both ports read
// directly. The mode is tested against the real case set rather than a
// fixture, so a case added to `deterministic.cases` is covered here
// without more work. What is called is countParses rather than
// RunDeterministic: the parser version check in between reads build
// information that a test binary does not carry, and the built binary's
// whole path is covered by scripts/runners.test.mjs.
func counted(t *testing.T, benchmarkID, caseID string, iterations int) *DeterministicResult {
	t.Helper()
	manifests, err := loadManifests(filepath.Join("..", "..", "..", "..", "benchmarks"))
	if err != nil {
		t.Fatal(err)
	}
	for index := range manifests {
		if manifests[index].ID != benchmarkID {
			continue
		}
		for _, performanceCase := range manifests[index].PerformanceCases {
			if performanceCase.ID != caseID {
				continue
			}
			result, err := countParses(&manifests[index], &performanceCase, iterations)
			if err != nil {
				t.Fatalf("countParses(%s/%s, %d): %v", benchmarkID, caseID, iterations, err)
			}
			return result
		}
	}
	t.Fatalf("%s/%s is not a performance case in the repository's manifests", benchmarkID, caseID)
	return nil
}

// The harness holds the loop's checksum to the count times the checksum
// of the parse before the loop. Both are pinned here to what the Rust
// runner and the harness's fixture carry: 512 for the adder (the sum of
// 512 ones) and 1 for the palindrome (true), and the adder input's hash
// is the one the harness's test file names.
func TestRunDeterministicParsesOnceAndThenExactlyTheCountAsked(t *testing.T) {
	const terms512 = "c6973089da125bc7162b53db8e8e6fa05cd62ce89ff873f197625ab4c08bf194"
	for _, test := range []struct {
		benchmark, caseID string
		iterations        int
		parse, loop       float64
		bytes             int
		sha256            string
	}{
		{"adder", "terms-512", 3, 512, 1536, 1023, terms512},
		{"adder", "terms-512", 0, 512, 0, 1023, terms512},
		{"palindrome", "chars-1024", 2, 1, 2, 1024, ""},
	} {
		result := counted(t, test.benchmark, test.caseID, test.iterations)
		if result.BenchmarkID != test.benchmark || result.CaseID != test.caseID || result.Iterations != test.iterations {
			t.Fatalf("%s/%s at %d: reported %s/%s at %d",
				test.benchmark, test.caseID, test.iterations, result.BenchmarkID, result.CaseID, result.Iterations)
		}
		if result.ParseChecksum != test.parse || result.Checksum != test.loop {
			t.Fatalf("%s/%s at %d: parse checksum %v and loop checksum %v; want %v and %v",
				test.benchmark, test.caseID, test.iterations, result.ParseChecksum, result.Checksum, test.parse, test.loop)
		}
		if result.Input.Bytes != test.bytes || (test.sha256 != "" && result.Input.SHA256 != test.sha256) {
			t.Fatalf("%s/%s: input %d bytes, sha256 %s; want %d bytes, sha256 %s",
				test.benchmark, test.caseID, result.Input.Bytes, result.Input.SHA256, test.bytes, test.sha256)
		}
	}
}

// The document says what the runtime has, not what the environment
// says. The harness sets GOMAXPROCS=1 and GOGC=off and refuses a count
// whose report differs, and a report copied from the environment would
// pass that check under any collector setting at all.
func TestRunDeterministicReportsTheSettingsTheRuntimeHas(t *testing.T) {
	previousProcs := runtime.GOMAXPROCS(1)
	defer runtime.GOMAXPROCS(previousProcs)
	previousPercent := debug.SetGCPercent(-1)
	defer debug.SetGCPercent(previousPercent)

	got := counted(t, "adder", "terms-512", 1).Environment
	if len(got) != 2 || got["GOMAXPROCS"] != "1" || got["GOGC"] != "off" {
		t.Fatalf("environment = %v; want GOMAXPROCS=1 and GOGC=off", got)
	}

	debug.SetGCPercent(150)
	if got = counted(t, "adder", "terms-512", 1).Environment; got["GOGC"] != "150" {
		t.Fatalf("environment = %v after SetGCPercent(150); want GOGC=150", got)
	}
	if debug.SetGCPercent(150) != 150 {
		t.Fatal("reading the settings back changed the collector's percent")
	}
}
