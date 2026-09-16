package runner

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"runtime"
	"runtime/debug"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"
)

const checksumModulus = 1_000_000_007

func Run(arguments Arguments) (*Result, error) {
	config := MeasureConfig{}
	if err := readJSON(arguments.Config, &config); err != nil {
		return nil, err
	}
	profile, exists := config.Profiles[arguments.Profile]
	if !exists {
		return nil, fmt.Errorf("unknown profile: %s", arguments.Profile)
	}

	port, err := findPort(config.Ports, "go")
	if err != nil {
		return nil, err
	}
	actualParserVersion, err := dependencyVersion(port.Parser.Module)
	if err != nil {
		return nil, err
	}
	if actualParserVersion != port.Parser.Version {
		return nil, fmt.Errorf("configured %s %s, loaded %s", port.Parser.Module, port.Parser.Version, actualParserVersion)
	}

	manifests, err := loadManifests(arguments.Benchmarks)
	if err != nil {
		return nil, err
	}
	capabilities := make([]CapabilityGroup, 0, len(manifests))
	measurements := make([]Measurement, 0)
	for _, manifest := range manifests {
		parser, parserErr := makeParser(manifest.ID)
		if parserErr != nil {
			return nil, parserErr
		}
		capabilities = append(capabilities, runCapabilities(manifest, parser))
		for _, performanceCase := range manifest.PerformanceCases {
			measurement, measurementErr := runMeasurement(manifest, performanceCase, parser, profile)
			if measurementErr != nil {
				return nil, measurementErr
			}
			measurements = append(measurements, measurement)
		}
	}

	environment := detectEnvironment(arguments.HostFingerprint)
	return &Result{
		Schema:        "https://tabnas.github.io/measure/schemas/port-result.schema.json",
		SchemaVersion: 3,
		Run: RunMetadata{
			ID: arguments.RunID, GeneratedAt: arguments.GeneratedAt,
			Profile: arguments.Profile, SuiteVersion: config.SuiteVersion,
			RepositoryCommit: arguments.Commit, RepositoryDirty: arguments.Dirty,
		},
		Port: PortMetadata{
			ID: port.ID, Label: port.Label, Language: "Go", Runtime: "Go",
			RuntimeVersion: runtime.Version(), ParserModule: port.Parser.Module,
			ParserVersion: actualParserVersion,
		},
		Environment: environment,
		Methodology: Methodology{
			Scope: "parse-only-steady-state-sequential", WarmupMS: profile.WarmupMS,
			SampleTargetMS: profile.SampleTargetMS, Samples: profile.Samples,
			MaxIterations: profile.MaxIterations,
		},
		Capabilities: capabilities,
		Measurements: measurements,
	}, nil
}

// RunDeterministic mirrors the Rust runner's mode of the same name: no
// warmup, no calibration, no clock, one parse and then exactly Iterations
// parses of one case, with both checksums in the output. The harness
// runs the process under callgrind at the configured count and again at
// zero, and the difference is what the counted parses cost; the config
// read, the parser construction, the input generation and the parse
// before the loop are in both and cancel. Valgrind only tolerates this
// binary with GOMAXPROCS=1, which the harness sets, and the count is
// only repeatable with GOGC=off, which it also sets; the document
// reports both as the runtime has them, not as the environment says.
func RunDeterministic(arguments DeterministicArguments) (*DeterministicResult, error) {
	config := MeasureConfig{}
	if err := readJSON(arguments.Config, &config); err != nil {
		return nil, err
	}
	port, err := findPort(config.Ports, "go")
	if err != nil {
		return nil, err
	}
	actualParserVersion, err := dependencyVersion(port.Parser.Module)
	if err != nil {
		return nil, err
	}
	if actualParserVersion != port.Parser.Version {
		return nil, fmt.Errorf("configured %s %s, loaded %s", port.Parser.Module, port.Parser.Version, actualParserVersion)
	}

	manifests, err := loadManifests(arguments.Benchmarks)
	if err != nil {
		return nil, err
	}
	var manifest *BenchmarkManifest
	for index := range manifests {
		if manifests[index].ID == arguments.BenchmarkID {
			manifest = &manifests[index]
		}
	}
	if manifest == nil {
		return nil, fmt.Errorf("unknown benchmark: %s", arguments.BenchmarkID)
	}
	var performanceCase *PerformanceCase
	for index := range manifest.PerformanceCases {
		if manifest.PerformanceCases[index].ID == arguments.CaseID {
			performanceCase = &manifest.PerformanceCases[index]
		}
	}
	if performanceCase == nil {
		return nil, fmt.Errorf("unknown performance case: %s/%s", arguments.BenchmarkID, arguments.CaseID)
	}
	return countParses(manifest, performanceCase, arguments.Iterations)
}

// countParses is the counted mode proper, from the manifest and case
// already resolved: the parser, the input, one parse, the loop, and the
// document. It is what the package's tests exercise, because the parser
// version check above reads build information a test binary does not
// carry; the built binary's whole path is covered by
// scripts/runners.test.mjs.
func countParses(manifest *BenchmarkManifest, performanceCase *PerformanceCase, iterations int) (*DeterministicResult, error) {
	parser, err := makeParser(manifest.ID)
	if err != nil {
		return nil, err
	}
	input, err := generateInput(*performanceCase)
	if err != nil {
		return nil, err
	}
	environment := effectiveSettings()

	// One parse before the counted loop, in both runs. Whatever an engine
	// leaves until it is first asked to parse is then in the baseline as
	// well as in the measured run, and cancels, instead of sitting in the
	// per-parse figure at one part in Iterations. Its checksum is reported
	// on its own so the harness can hold the loop's to it.
	first, parseErr := parser.Parse(input)
	if parseErr != nil {
		return nil, fmt.Errorf("%s/%s parse: %w", manifest.ID, performanceCase.ID, parseErr)
	}
	parseChecksum := int64(checksumValue(first))

	checksum := int64(0)
	for index := 0; index < iterations; index++ {
		result, parseErr := parser.Parse(input)
		if parseErr != nil {
			return nil, fmt.Errorf("%s/%s parse: %w", manifest.ID, performanceCase.ID, parseErr)
		}
		checksum = (checksum + int64(checksumValue(result))) % checksumModulus
	}

	return &DeterministicResult{
		BenchmarkID: manifest.ID, CaseID: performanceCase.ID,
		Input: InputIdentity{
			Bytes: len([]byte(input)), CodeUnits: len(utf16.Encode([]rune(input))), SHA256: hashString(input),
		},
		Iterations: iterations, ParseChecksum: float64(parseChecksum), Checksum: float64(checksum),
		Environment: environment,
	}, nil
}

// The settings the count depends on, read back from the runtime rather
// than copied from the environment: GOMAXPROCS as the scheduler has it
// and GOGC as the collector has it. The document then says what the
// process ran under, and the harness holds that against what the config
// asked for, so a count taken with the collector on cannot be recorded
// under a config that says it was off.
//
// SetGCPercent is the runtime's only reader of the percent that can say
// "off": runtime/metrics reports the same state as a wrapped uint64. It
// returns the previous value, and setting that straight back leaves the
// runtime as it was. Called before any parse, so both counted runs carry
// it alike.
func effectiveSettings() map[string]string {
	percent := debug.SetGCPercent(-1)
	debug.SetGCPercent(percent)
	gogc := strconv.Itoa(percent)
	if percent < 0 {
		gogc = "off"
	}
	return map[string]string{
		"GOMAXPROCS": strconv.Itoa(runtime.GOMAXPROCS(0)),
		"GOGC":       gogc,
	}
}

func runCapabilities(manifest BenchmarkManifest, parser parserAdapter) CapabilityGroup {
	results := make([]CapabilityResult, 0, len(manifest.CapabilityCases))
	passed := 0
	for _, testCase := range manifest.CapabilityCases {
		actual, parseErr := parser.Parse(testCase.Input)
		accepted := parseErr == nil
		casePassed := accepted == testCase.Accept && (!testCase.Accept || reflect.DeepEqual(actual, testCase.Expected))
		result := CapabilityResult{
			CaseID: testCase.ID, Description: testCase.Description,
			AcceptExpected: testCase.Accept, Accepted: accepted, Passed: casePassed,
		}
		if testCase.Accept {
			result.Expected = testCase.Expected
		}
		if accepted {
			result.Actual = actual
		}
		if parseErr != nil {
			result.Error = cleanError(parseErr)
		}
		if casePassed {
			passed++
		}
		results = append(results, result)
	}
	return CapabilityGroup{BenchmarkID: manifest.ID, Passed: passed, Total: len(results), Cases: results}
}

func runMeasurement(manifest BenchmarkManifest, performanceCase PerformanceCase, parser parserAdapter, profile Profile) (Measurement, error) {
	input, err := generateInput(performanceCase)
	if err != nil {
		return Measurement{}, err
	}
	if _, err = parser.Parse(input); err != nil {
		return Measurement{}, fmt.Errorf("%s/%s correctness parse: %w", manifest.ID, performanceCase.ID, err)
	}

	warmupUntil := time.Now().Add(time.Duration(profile.WarmupMS) * time.Millisecond)
	for time.Now().Before(warmupUntil) {
		if _, err = parser.Parse(input); err != nil {
			return Measurement{}, err
		}
	}

	iterations := 1
	for iterations < profile.MaxIterations {
		elapsed, _, batchErr := timeBatch(parser, input, iterations)
		if batchErr != nil {
			return Measurement{}, batchErr
		}
		if elapsed >= time.Duration(profile.SampleTargetMS)*time.Millisecond {
			break
		}
		iterations *= 2
		if iterations > profile.MaxIterations {
			iterations = profile.MaxIterations
		}
	}

	runtime.GC()
	samples := make([]Sample, 0, profile.Samples)
	checksum := 0.0
	for index := 0; index < profile.Samples; index++ {
		elapsed, batchChecksum, batchErr := timeBatch(parser, input, iterations)
		if batchErr != nil {
			return Measurement{}, batchErr
		}
		checksum = float64((int64(checksum) + int64(batchChecksum)) % checksumModulus)
		samples = append(samples, Sample{ElapsedNS: float64(elapsed.Nanoseconds())})
	}

	return Measurement{
		BenchmarkID: manifest.ID, CaseID: performanceCase.ID,
		Description: performanceCase.Description,
		Input: InputIdentity{
			Bytes: len([]byte(input)), CodeUnits: len(utf16.Encode([]rune(input))), SHA256: hashString(input),
		},
		IterationsPerSample: iterations, Samples: samples, Checksum: checksum,
	}, nil
}

func timeBatch(parser parserAdapter, input string, iterations int) (time.Duration, float64, error) {
	checksum := int64(0)
	started := time.Now()
	for index := 0; index < iterations; index++ {
		result, err := parser.Parse(input)
		if err != nil {
			return 0, 0, err
		}
		checksum = (checksum + int64(checksumValue(result))) % checksumModulus
	}
	return time.Since(started), float64(checksum), nil
}

func checksumValue(value any) int {
	switch typed := value.(type) {
	case float64:
		return int(typed) % checksumModulus
	case int:
		return typed % checksumModulus
	case bool:
		if typed {
			return 1
		}
		return 0
	default:
		encoded, _ := json.Marshal(value)
		return len(encoded)
	}
}

func generateInput(performanceCase PerformanceCase) (string, error) {
	generator := performanceCase.Generator
	switch generator.Kind {
	case "adder-chain":
		terms := make([]string, generator.Size)
		for index := range terms {
			terms[index] = strconv.Itoa(generator.Value)
		}
		return strings.Join(terms, "+"), nil
	case "even-palindrome":
		if generator.Size <= 0 || generator.Size%2 != 0 || generator.Pattern == "" {
			return "", fmt.Errorf("invalid even-palindrome generator for %s", performanceCase.ID)
		}
		halfLength := generator.Size / 2
		half := strings.Repeat(generator.Pattern, (halfLength+len(generator.Pattern)-1)/len(generator.Pattern))[:halfLength]
		halfRunes := []rune(half)
		reversed := make([]rune, len(halfRunes))
		for index := range halfRunes {
			reversed[len(halfRunes)-1-index] = halfRunes[index]
		}
		return half + string(reversed), nil
	default:
		return "", fmt.Errorf("unknown generator kind: %s", generator.Kind)
	}
}

func loadManifests(directory string) ([]BenchmarkManifest, error) {
	paths, err := filepath.Glob(filepath.Join(directory, "*", "benchmark.json"))
	if err != nil {
		return nil, err
	}
	sort.Strings(paths)
	manifests := make([]BenchmarkManifest, 0, len(paths))
	for _, path := range paths {
		manifest := BenchmarkManifest{}
		if err = readJSON(path, &manifest); err != nil {
			return nil, err
		}
		manifests = append(manifests, manifest)
	}
	return manifests, nil
}

func readJSON(path string, destination any) error {
	content, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}
	if err = json.Unmarshal(content, destination); err != nil {
		return fmt.Errorf("decode %s: %w", path, err)
	}
	return nil
}

func findPort(ports []PortConfig, id string) (PortConfig, error) {
	for _, port := range ports {
		if port.ID == id {
			return port, nil
		}
	}
	return PortConfig{}, fmt.Errorf("the configuration has no %s port", id)
}

func dependencyVersion(module string) (string, error) {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return "", errors.New("Go build information is unavailable")
	}
	for _, dependency := range info.Deps {
		if dependency.Path == module {
			return strings.TrimPrefix(dependency.Version, "v"), nil
		}
	}
	return "", fmt.Errorf("dependency %s is absent from Go build information", module)
}

func detectEnvironment(hostFingerprint string) Environment {
	osID, architecture := runtime.GOOS, runtime.GOARCH
	osName := operatingSystemName(osID)
	kernelVersion := operatingSystemKernelVersion()
	cpu := cpuModel()
	logicalCPUs := runtime.NumCPU()
	memoryBytes := totalMemoryBytes()
	fingerprintInput, _ := json.Marshal(struct {
		OS            string `json:"os"`
		OSName        string `json:"osName"`
		KernelVersion string `json:"kernelVersion"`
		Arch          string `json:"arch"`
		CPU           string `json:"cpu"`
		LogicalCPUs   int    `json:"logicalCpus"`
		MemoryBytes   uint64 `json:"memoryBytes"`
	}{osID, osName, kernelVersion, architecture, cpu, logicalCPUs, memoryBytes})
	return Environment{
		Fingerprint: hashString(string(fingerprintInput)), HostFingerprint: hostFingerprint,
		OS: osID, OSName: osName,
		KernelVersion: kernelVersion, Arch: architecture, CPU: cpu,
		LogicalCPUs: logicalCPUs, MemoryBytes: memoryBytes,
	}
}

func operatingSystemName(fallback string) string {
	for _, path := range []string{"/etc/os-release", "/usr/lib/os-release"} {
		content, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		for _, line := range strings.Split(string(content), "\n") {
			if value, found := strings.CutPrefix(line, "PRETTY_NAME="); found {
				if name := unquoteOSReleaseValue(value); name != "" {
					return name
				}
			}
		}
	}
	return fallback
}

func unquoteOSReleaseValue(value string) string {
	value = strings.TrimSpace(value)
	if len(value) >= 2 && ((value[0] == '"' && value[len(value)-1] == '"') ||
		(value[0] == '\'' && value[len(value)-1] == '\'')) {
		value = value[1 : len(value)-1]
	}
	value = strings.ReplaceAll(value, `\"`, `"`)
	return strings.ReplaceAll(value, `\\`, `\`)
}

func operatingSystemKernelVersion() string {
	if content, err := os.ReadFile("/proc/sys/kernel/osrelease"); err == nil {
		if version := strings.TrimSpace(string(content)); version != "" {
			return version
		}
	}
	if output, err := exec.Command("uname", "-r").Output(); err == nil {
		if version := strings.TrimSpace(string(output)); version != "" {
			return version
		}
	}
	return runtime.GOOS
}

func cleanError(err error) string {
	message := strings.Split(err.Error(), "\n")[0]
	if len(message) > 500 {
		return message[:500]
	}
	return message
}

func hashString(value string) string {
	digest := sha256.Sum256([]byte(value))
	return hex.EncodeToString(digest[:])
}
