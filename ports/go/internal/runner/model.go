package runner

type MeasureConfig struct {
	SchemaVersion int                `json:"schemaVersion"`
	SuiteVersion  string             `json:"suiteVersion"`
	Profiles      map[string]Profile `json:"profiles"`
	Ports         []PortConfig       `json:"ports"`
}

type Profile struct {
	WarmupMS       int `json:"warmupMs"`
	SampleTargetMS int `json:"sampleTargetMs"`
	Samples        int `json:"samples"`
	MaxIterations  int `json:"maxIterations"`
}

type PortConfig struct {
	ID     string `json:"id"`
	Label  string `json:"label"`
	Parser struct {
		Module  string `json:"module"`
		Version string `json:"version"`
	} `json:"parser"`
	Command   string   `json:"command"`
	Arguments []string `json:"arguments"`
}

type BenchmarkManifest struct {
	SchemaVersion    int               `json:"schemaVersion"`
	ID               string            `json:"id"`
	Title            string            `json:"title"`
	Summary          string            `json:"summary"`
	Classification   []string          `json:"classification"`
	Reference        Reference         `json:"reference"`
	CapabilityCases  []CapabilityCase  `json:"capabilityCases"`
	PerformanceCases []PerformanceCase `json:"performanceCases"`
}

type Reference struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type CapabilityCase struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Input       string `json:"input"`
	Accept      bool   `json:"accept"`
	Expected    any    `json:"expected"`
}

type PerformanceCase struct {
	ID          string    `json:"id"`
	Description string    `json:"description"`
	Generator   Generator `json:"generator"`
}

type Generator struct {
	Kind    string `json:"kind"`
	Size    int    `json:"size"`
	Value   int    `json:"value"`
	Pattern string `json:"pattern"`
}

type Arguments struct {
	Config          string
	Benchmarks      string
	Profile         string
	RunID           string
	GeneratedAt     string
	Commit          string
	Dirty           bool
	HostFingerprint string
}

type Result struct {
	Schema        string            `json:"$schema"`
	SchemaVersion int               `json:"schemaVersion"`
	Run           RunMetadata       `json:"run"`
	Port          PortMetadata      `json:"port"`
	Environment   Environment       `json:"environment"`
	Methodology   Methodology       `json:"methodology"`
	Capabilities  []CapabilityGroup `json:"capabilities"`
	Measurements  []Measurement     `json:"measurements"`
}

type RunMetadata struct {
	ID               string `json:"id"`
	GeneratedAt      string `json:"generatedAt"`
	Profile          string `json:"profile"`
	SuiteVersion     string `json:"suiteVersion"`
	RepositoryCommit string `json:"repositoryCommit"`
	RepositoryDirty  bool   `json:"repositoryDirty"`
}

type PortMetadata struct {
	ID             string `json:"id"`
	Label          string `json:"label"`
	Language       string `json:"language"`
	Runtime        string `json:"runtime"`
	RuntimeVersion string `json:"runtimeVersion"`
	ParserModule   string `json:"parserModule"`
	ParserVersion  string `json:"parserVersion"`
}

type Environment struct {
	Fingerprint     string `json:"fingerprint"`
	HostFingerprint string `json:"hostFingerprint"`
	OS              string `json:"os"`
	OSName          string `json:"osName"`
	KernelVersion   string `json:"kernelVersion"`
	Arch            string `json:"arch"`
	CPU             string `json:"cpu"`
	LogicalCPUs     int    `json:"logicalCpus"`
	MemoryBytes     uint64 `json:"memoryBytes"`
}

type Methodology struct {
	Scope          string `json:"scope"`
	WarmupMS       int    `json:"warmupMs"`
	SampleTargetMS int    `json:"sampleTargetMs"`
	Samples        int    `json:"samples"`
	MaxIterations  int    `json:"maxIterations"`
}

type CapabilityGroup struct {
	BenchmarkID string             `json:"benchmarkId"`
	Passed      int                `json:"passed"`
	Total       int                `json:"total"`
	Cases       []CapabilityResult `json:"cases"`
}

type CapabilityResult struct {
	CaseID         string `json:"caseId"`
	Description    string `json:"description"`
	AcceptExpected bool   `json:"acceptExpected"`
	Accepted       bool   `json:"accepted"`
	Passed         bool   `json:"passed"`
	Expected       any    `json:"expected,omitempty"`
	Actual         any    `json:"actual,omitempty"`
	Error          string `json:"error,omitempty"`
}

type Measurement struct {
	BenchmarkID         string        `json:"benchmarkId"`
	CaseID              string        `json:"caseId"`
	Description         string        `json:"description"`
	Input               InputIdentity `json:"input"`
	IterationsPerSample int           `json:"iterationsPerSample"`
	Samples             []Sample      `json:"samples"`
	Checksum            float64       `json:"checksum"`
}

type InputIdentity struct {
	Bytes     int    `json:"bytes"`
	CodeUnits int    `json:"codeUnits"`
	SHA256    string `json:"sha256"`
}

type Sample struct {
	ElapsedNS float64 `json:"elapsedNs"`
}
