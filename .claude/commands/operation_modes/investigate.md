[{! INVESTIGATE MODE GUIDANCE:

**Purpose**: Thorough codebase investigation to create context maps before implementation.

**Investigation Phase**:
1. Read project CLAUDE.md for repo structure
2. Identify investigation scope (full repo vs specific modules)
3. Check for existing context maps in `00_DOCS/`

**Routing Logic**:
- **Small Repo (<100 files)** ’ Direct investigation (agent uses Glob/Grep)
- **Medium Repo (100-500 files)** ’ Launch single `Task: Explore` agent
- **Large Repo (500+ files)** ’ Pattern A: Launch per-module investigators in parallel
- **Unknown Architecture** ’ Start with CLAUDE.md + README, then partition

**Investigation Deliverables**:
1. **Context Maps**: `repo://path/file.ts:10-50` format with key files documented
2. **Architecture Overview**: High-level component relationships
3. **Critical Paths**: Where core logic lives (auth, data processing, API)
4. **Recommendations**: Suggested partitioning for parallel work

**Output Location**: Save to `00_DOCS/context-maps/[module]-context-map.md`

**Next Steps**: After investigation complete, use context maps to:
- Inform orchestration partitioning decisions
- Brief specialist subagents with precise file references
- Avoid redundant exploration by future agents }]
