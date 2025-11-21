---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, dependency-analysis, wave-planning]
  tldr: "Algorithm and strategy for building file dependency graphs and planning refactoring waves based on investigator-discovered dependencies"
  dependencies: [system-overview.md, ../../SKILL.md]
  last_updated: 2025-11-19
---

# Documentation Refactoring System - Dependency Graph Planning

## Purpose

This document specifies the algorithm and strategy for building file dependency graphs and planning refactoring waves based on investigator-discovered dependencies.

## Core Principle

**Investigator-Driven Discovery**: Instead of the orchestrator pre-computing dependencies, each investigator agent discovers its target file's dependencies during analysis. This approach:
- Leverages investigator's full context window
- Ensures accurate dependency identification
- Updates frontmatter automatically
- Reports dependencies back for wave planning

## Dependency Sources

The system identifies dependencies from multiple sources:

### 1. Frontmatter 'dependencies' Field

```yaml
---
metadata:
  dependencies: [file1.md, file2.md, ../specs/spec.md]
---
```

**Authority**: High (explicitly declared)
**Updated By**: Investigator agents during analysis
**Format**: Relative paths from target file

### 2. Markdown References

**Inline Links**:
```markdown
See [Architecture](./architecture.md) for details.
```

**Reference-Style Links**:
```markdown
[link-id]: ./other-file.md
```

**File References**:
```markdown
@./path/to/file.md
```

**Authority**: Medium (implicit content dependency)
**Discovered By**: Investigator agents parsing content

### 3. Directory Hierarchy

**Principle**: Parent directories are foundational to child directories

```
00_DOCS/
├── architecture/          # Foundational (Wave 1)
│   ├── system-overview.md
│   └── workflow.md
├── specifications/        # Intermediate (Wave 2, depends on architecture)
│   ├── command-spec.md
│   └── agent-spec.md
└── guides/                # Dependent (Wave 3, depends on specifications)
    └── user-guide.md
```

**Authority**: Low (heuristic, can be overridden by frontmatter)
**Inferred By**: Orchestrator from file paths

## Investigation Phase: Dependency Discovery

### Investigator Responsibilities

Each `/investigate-doc` task:

1. **Reads target file** + all foundational documents
2. **Parses content** for markdown references, @-links, file mentions
3. **Identifies dependencies**:
   - Files this target depends on (reads from)
   - Files that reference this target (depend on this file)
4. **Updates frontmatter**:
   - Adds/updates `metadata.dependencies` field
   - Follows format from global CLAUDE.md guidelines
5. **Reports back** to orchestrator:
   - Dependency list in JSON
   - Suggested wave number (based on discovered dependencies)

### Example Investigator Output

**Markdown Report** (frontmatter updated in actual file):
```markdown
---
metadata:
  dependencies: [system-overview.md, ../specifications/command-spec.md]
---

# Investigation Report: guides/user-guide.md

## Dependency Analysis (Discovered by Investigator)
- **Depends on**:
  - `system-overview.md` (references architecture concepts)
  - `../specifications/command-spec.md` (documents commands)
- **Referenced by**:
  - `README.md` (links to this guide)
- **Suggested Wave**: Wave 3 (depends on Wave 2 files)
- **Rationale**: Must refactor after system-overview and command-spec updated
```

**JSON to Orchestrator**:
```json
{
  "status": "completed",
  "report_file": "investigation_guides_user_guide_md.md",
  "summary": "Analyzed guides/user-guide.md: 25% bloat, 2 questions, clear dependencies identified",
  "dependencies": {
    "depends_on": ["system-overview.md", "../specifications/command-spec.md"],
    "referenced_by": ["README.md"],
    "suggested_wave": 3,
    "frontmatter_updated": true
  }
}
```

## Orchestrator: Graph Building

### Step 1: Collect Dependency Data

After all investigators report back, orchestrator collects:
- `depends_on` lists from each investigator
- `referenced_by` lists (inverse relationships)
- File paths (for directory hierarchy inference)

### Step 2: Build Adjacency List

**Data Structure**:
```json
{
  "file1.md": {
    "depends_on": [],
    "referenced_by": ["file2.md", "file3.md"],
    "path": "architecture/file1.md",
    "is_foundational": true
  },
  "file2.md": {
    "depends_on": ["file1.md"],
    "referenced_by": ["file4.md"],
    "path": "specifications/file2.md",
    "is_foundational": false
  },
  "file3.md": {
    "depends_on": ["file1.md", "file2.md"],
    "referenced_by": [],
    "path": "guides/file3.md",
    "is_foundational": false
  }
}
```

### Step 3: Detect Cycles

**Algorithm**: Depth-First Search (DFS) with cycle detection

```
function detect_cycle(graph):
  visited = set()
  rec_stack = set()

  for node in graph:
    if node not in visited:
      if dfs_cycle(node, visited, rec_stack, graph):
        return cycle_path

  return None

function dfs_cycle(node, visited, rec_stack, graph):
  visited.add(node)
  rec_stack.add(node)

  for neighbor in graph[node].depends_on:
    if neighbor not in visited:
      if dfs_cycle(neighbor, visited, rec_stack, graph):
        return True
    elif neighbor in rec_stack:
      return True  # Cycle detected

  rec_stack.remove(node)
  return False
```

**If Cycle Detected**:
1. Orchestrator identifies cycle path (e.g., A → B → C → A)
2. Reports to user in main chat
3. Blocks refactoring until user resolves:
   - Option 1: Remove dependency from frontmatter
   - Option 2: Restructure files to break cycle
   - Option 3: Mark one file as "can be refactored independently"

### Step 4: Topological Sort

**Algorithm**: Kahn's Algorithm (BFS-based)

```
function topological_sort(graph):
  in_degree = {}
  for node in graph:
    in_degree[node] = len(graph[node].depends_on)

  queue = [node for node in graph if in_degree[node] == 0]
  sorted_order = []

  while queue:
    node = queue.pop(0)
    sorted_order.append(node)

    for neighbor in graph[node].referenced_by:
      in_degree[neighbor] -= 1
      if in_degree[neighbor] == 0:
        queue.append(neighbor)

  if len(sorted_order) != len(graph):
    return None  # Cycle exists

  return sorted_order
```

**Output**: Linear ordering where dependencies come before dependents

### Step 5: Group into Waves

**Algorithm**:
```
function group_into_waves(sorted_order, graph):
  waves = []
  wave_assignments = {}

  for node in sorted_order:
    # Find max wave of dependencies
    max_dep_wave = 0
    for dep in graph[node].depends_on:
      if dep in wave_assignments:
        max_dep_wave = max(max_dep_wave, wave_assignments[dep])

    # Assign to next wave
    current_wave = max_dep_wave + 1
    wave_assignments[node] = current_wave

    # Add to waves list
    if current_wave > len(waves):
      waves.append([])
    waves[current_wave - 1].append(node)

  return waves
```

**Output**:
```json
{
  "wave_1": ["file1.md", "file5.md", "README.md"],
  "wave_2": ["file2.md", "file3.md", "file6.md"],
  "wave_3": ["file4.md"]
}
```

### Step 6: Identify Parallelization Opportunities

Within each wave, determine which files can be bundled (1-3 files per refactorer):

**Bundling Criteria**:
1. **Size**: Small files (<100 lines each) can be bundled
2. **Connectivity**: Files that reference each other heavily
3. **Directory**: Files in same subdirectory

**Algorithm**:
```
function plan_parallelization(wave, graph):
  bundles = []

  for file in wave:
    # Check if file can be bundled with existing bundle
    bundled = False
    for bundle in bundles:
      if can_bundle(file, bundle, graph):
        bundle.add(file)
        bundled = True
        break

    if not bundled:
      bundles.append([file])

  return bundles

function can_bundle(file, bundle, graph):
  # Max 3 files per bundle
  if len(bundle) >= 3:
    return False

  # Check size (estimate from investigation reports)
  if total_lines(bundle) + file_lines(file) > 500:
    return False

  # Check connectivity (prefer high cross-references)
  if any(file in graph[b].referenced_by for b in bundle):
    return True

  # Check same directory
  if same_directory(file, bundle):
    return True

  return False
```

**Output**:
```json
{
  "wave_1_bundles": [
    ["file1.md"],
    ["file5.md", "file5b.md"]
  ],
  "wave_2_bundles": [
    ["file2.md", "file3.md"],
    ["file6.md"]
  ]
}
```

## Refactoring Plan Output

The orchestrator creates `refactoring_plan.json`:

```json
{
  "session_id": "docs-refactoring-251119-1430",
  "created": "2025-11-19T14:35:00Z",
  "total_files": 15,
  "total_waves": 3,
  "waves": [
    {
      "wave_number": 1,
      "description": "Foundational files (no dependencies)",
      "files": ["file1.md", "file5.md", "README.md", "PRD.md", "CLAUDE.md"],
      "bundles": [
        {
          "bundle_id": "wave1_bundle1",
          "files": ["file1.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        },
        {
          "bundle_id": "wave1_bundle2",
          "files": ["file5.md", "file5b.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        },
        {
          "bundle_id": "wave1_bundle3",
          "files": ["README.md", "PRD.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        }
      ]
    },
    {
      "wave_number": 2,
      "description": "Intermediate files (depend on Wave 1)",
      "files": ["file2.md", "file3.md", "file4.md", "file6.md"],
      "bundles": [
        {
          "bundle_id": "wave2_bundle1",
          "files": ["file2.md", "file3.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        },
        {
          "bundle_id": "wave2_bundle2",
          "files": ["file4.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        },
        {
          "bundle_id": "wave2_bundle3",
          "files": ["file6.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        }
      ]
    },
    {
      "wave_number": 3,
      "description": "Dependent files (depend on Wave 2)",
      "files": ["file7.md", "file8.md"],
      "bundles": [
        {
          "bundle_id": "wave3_bundle1",
          "files": ["file7.md", "file8.md"],
          "refactorer": "/refactor-doc",
          "status": "pending"
        }
      ]
    }
  ]
}
```

## Execution Strategy

### Wave Execution

```
For each wave in refactoring_plan.json:
  1. Load wave bundles
  2. Launch parallel tasks (one per bundle)
  3. Wait for all tasks in wave to complete
  4. Update refactoring_plan.json (mark bundles "completed")
  5. Update session_state.json (current_wave++)
  6. Proceed to next wave
```

### Bundle Task Briefing

Orchestrator briefs each `/refactor-doc` task with:
- Files in bundle (1-3 files)
- Investigation report(s) for each file
- All consolidated summaries with user comments
- Dependency files (to read for context)
- Foundational documents (for alignment)

### Failure Handling

**Single File Failure**:
- Orchestrator logs failure
- Continues with other bundles in wave
- At end of wave, reports failed files to user
- User can retry or manually fix

**Entire Wave Failure**:
- Orchestrator stops progression (blocks next wave)
- Reports to user in main chat
- User investigates, resolves issue, resumes session

## Dependency Graph Visualization

The `dependency_graph.json` can be visualized:

```
file1.md (Wave 1)
  ↓ (depends on)
  ├─→ file2.md (Wave 2)
  │     ↓
  │     └─→ file4.md (Wave 3)
  └─→ file3.md (Wave 2)
        ↓
        └─→ file4.md (Wave 3)

file5.md (Wave 1, independent)
```

## Edge Cases

### Orphaned Files
- **Definition**: Files with no dependencies and not referenced by anyone
- **Treatment**: Assign to Wave 1 (can be refactored first)

### Self-Referential Files
- **Definition**: File references itself in content
- **Treatment**: Ignore self-reference, assign based on other dependencies

### Cross-Directory Dependencies
- **Definition**: File in `guides/` depends on file in `architecture/`
- **Treatment**: Directory hierarchy heuristic overridden by explicit dependencies

### Missing Dependency
- **Definition**: Frontmatter lists dependency that doesn't exist in session targets
- **Treatment**:
  - If file exists in repo: Read for context (not refactored)
  - If file doesn't exist: Warn user, suggest removing from frontmatter

### Bidirectional References
- **Definition**: A references B, B also references A (not a cycle if not in dependency chain)
- **Treatment**: Use frontmatter `dependencies` as authority (content references ≠ dependencies)

## Update Strategy During Session

The `refactoring_plan.json` is updated throughout session:

**After Each Wave**:
```json
{
  "wave_1_status": "completed",
  "wave_1_completed_at": "2025-11-19T14:50:00Z",
  "wave_2_status": "in_progress",
  "wave_2_started_at": "2025-11-19T14:50:30Z"
}
```

**After Each Bundle**:
```json
{
  "bundle_id": "wave2_bundle1",
  "status": "completed",
  "completed_at": "2025-11-19T14:52:00Z",
  "files_refactored": ["file2.md", "file3.md"],
  "bloat_removed": "28%"
}
```

This enables:
- **Progress Tracking**: User can monitor session progress
- **Restart Capability**: If interrupted, orchestrator resumes from last completed wave
- **Audit Trail**: Complete history of what was refactored when

## Next Steps

For related specifications:
- `session-state-tracking.md` - How session_state.json + refactoring_plan.json enable restart
- `../specifications/investigator-spec.md` - Detailed investigator responsibilities
- `../specifications/refactor-spec.md` - How refactor agents consume the plan
