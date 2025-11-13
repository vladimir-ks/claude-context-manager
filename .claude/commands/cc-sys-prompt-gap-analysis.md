---
description: Analyze Claude Code system prompt documentation for gaps and extract runtime variables (auto-discovers location)
argument-hint: [optional-path-to-system-prompt-dir]
allowed-tools: Write
---

## Pre-Execution Context

**🔍 Auto-Discovery**

Target Directory:
!`echo "📁 ${1:-00_DOCS/research/claude-code-system-prompt}"`

**Verify Directory Exists:**
!`test -d "${1:-00_DOCS/research/claude-code-system-prompt}" && echo "✅ Directory found" || echo "❌ ERROR: Directory not found - provide path as argument"`

**Verify Source File:**
!`test -f "${1:-00_DOCS/research/claude-code-system-prompt}/CONCATENATED_SYSTEM_PROMPT_COMPLETE.md" && echo "✅ CONCATENATED_SYSTEM_PROMPT_COMPLETE.md found" || echo "❌ ERROR: CONCATENATED_SYSTEM_PROMPT_COMPLETE.md not found"`

**Source File Metadata:**
!`test -f "${1:-00_DOCS/research/claude-code-system-prompt}/CONCATENATED_SYSTEM_PROMPT_COMPLETE.md" && ls -lh "${1:-00_DOCS/research/claude-code-system-prompt}/CONCATENATED_SYSTEM_PROMPT_COMPLETE.md" | awk '{print "📄 Size: " $5 " | Modified: " $6 " " $7 " " $8}' || echo "N/A"`

**📂 Directory Inventory**

Numbered Source Files:
!`ls -1 "${1:-00_DOCS/research/claude-code-system-prompt}"/[0-9]*.md 2>/dev/null | wc -l | awk '{print "📝 Source files (01-NN): " $1}'`

**📊 Existing Analysis Files Status**

Gap Analysis:
!`test -f "${1:-00_DOCS/research/claude-code-system-prompt}/_GAP_ANALYSIS.md" && ls -lh "${1:-00_DOCS/research/claude-code-system-prompt}/_GAP_ANALYSIS.md" | awk '{print "📊 _GAP_ANALYSIS.md: EXISTS (" $5 ", modified " $6 " " $7 ") - WILL BE OVERWRITTEN"}' || echo "📊 _GAP_ANALYSIS.md: NOT FOUND - will be created"`

Variables Snapshot:
!`test -f "${1:-00_DOCS/research/claude-code-system-prompt}/_CC_SYS_PROMPT_VARIABLES.md" && ls -lh "${1:-00_DOCS/research/claude-code-system-prompt}/_CC_SYS_PROMPT_VARIABLES.md" | awk '{print "📊 _CC_SYS_PROMPT_VARIABLES.md: EXISTS (" $5 ", modified " $6 " " $7 ") - WILL BE OVERWRITTEN"}' || echo "📊 _CC_SYS_PROMPT_VARIABLES.md: NOT FOUND - will be created"`

**🕐 Analysis Timestamp:**
!`date -u +"%Y-%m-%d %H:%M:%S UTC"`

---

# Your Task: Claude Code System Prompt Gap Analysis

**Think hard** about this comparison - accuracy is critical.

## Context

You are analyzing the documented Claude Code system prompt against your actual running system prompt to identify discrepancies. This helps detect when the actual Claude Code prompt has been updated but documentation hasn't been synchronized.

**Input File:** @${1:-00_DOCS/research/claude-code-system-prompt}/CONCATENATED_SYSTEM_PROMPT_COMPLETE.md

**Your Actual Prompt:** The system prompt you're currently operating under

**Output Directory:** ${1:-00_DOCS/research/claude-code-system-prompt}/

## CRITICAL: Understanding Variable Placeholders

**The documented file SHOULD contain variable placeholders**, not actual values:

✅ **CORRECT in documented file:**
- `{{MODEL_NAME}}` - placeholder for model name
- `{{WORKING_DIRECTORY}}` - placeholder for directory path
- `{{BRANCH_NAME}}` - placeholder for git branch
- `{{GIT_STATUS}}` - placeholder for git status output
- `{{TODAY_DATE}}` - placeholder for current date
- `{{CLAUDE_MD_CONTENT}}` - placeholder for user custom instructions
- etc.

❌ **INCORRECT in documented file:**
- `Sonnet 4.5` (actual value instead of {{MODEL_NAME}})
- `/Users/vmks/_dev_tools/...` (actual path instead of {{WORKING_DIRECTORY}})
- `master` (actual branch instead of {{BRANCH_NAME}})
- Hardcoded user-specific CLAUDE.md content (should be {{CLAUDE_MD_CONTENT}})

**When comparing:**
- **IGNORE differences where documented has {{VARIABLE}} and actual has real value** - this is expected and correct
- **DO flag if documented has actual hardcoded value instead of {{VARIABLE}}**
- **DO flag if variable placeholder format is wrong** (e.g., $MODEL_NAME instead of {{MODEL_NAME}})

## Two Output Files

You will generate TWO files in the same directory:

### 1. `_GAP_ANALYSIS.md`
Focuses on **permanent structural/instructional differences**:
- Missing/extra sections
- Changed instructions or guidelines
- Modified tool definitions
- Different examples or workflows
- XML tag differences
- **IGNORES variable value differences** ({{VAR}} vs actual value)

### 2. `_CC_SYS_PROMPT_VARIABLES.md`
Captures **all runtime variable values** from your actual prompt:
- Model name and ID
- Working directory
- Git branch, status, commits
- Platform, OS version
- Date/time
- Skills list
- Slash commands list
- MCP servers
- Any other dynamic values

This creates a **snapshot of the runtime state** when analysis was run.

## Analysis Requirements

Perform a **detailed section-by-section comparison** and identify:

### 1. Structural Analysis
- **Missing Sections**: Content in your actual prompt but NOT in the documented file
- **Extra Sections**: Content in the documented file but NOT in your actual prompt
- **Order Differences**: Sections appearing in different sequence
- **File Numbering**: Verify source files are properly numbered based on pre-execution count

### 2. Content Differences
For each major section, compare:
- **Exact wording**: Are instructions verbatim identical?
- **XML tags**: Are `<example>`, `<function_calls>`, `<env>`, etc. preserved exactly?
- **Variable placeholders**: Are `{{MODEL_NAME}}`, `{{WORKING_DIRECTORY}}`, etc. used correctly?
- **Tool definitions**: Are tool descriptions, parameters, and usage notes complete?
- **Examples**: Are all examples with their tags included?

### 3. Critical Changes
Identify changes that would affect Claude's behavior:
- New instructions or restrictions
- Removed capabilities or guidelines
- Modified tool access or permissions
- Updated workflows (git, PR, etc.)
- Changed agent descriptions or types

### 4. Severity Rating
Rate each discrepancy:
- **🔴 CRITICAL**: Missing core instructions, wrong tool definitions, security issues, hardcoded user data
- **🟡 MODERATE**: Incomplete examples, minor wording changes, missing XML tags, format differences
- **🟢 MINOR**: Formatting differences, capitalization inconsistencies, typos

## Output Format - CONCISE APPROACH

Generate TWO files in `${1:-00_DOCS/research/claude-code-system-prompt}/`:

### File 1: `_GAP_ANALYSIS.md`

**Structure:**

```markdown
# Claude Code System Prompt Gap Analysis

**Analysis Date:** [timestamp]
**Documented File:** CONCATENATED_SYSTEM_PROMPT_COMPLETE.md
**Source Files:** [count]

## Executive Summary

[2-3 sentences: Overall assessment]

**Status:** ✅ In Sync | ⚠️ Minor Issues | 🔴 Significant Gaps

**Total Discrepancies:** [number]
- Critical: [count]
- Moderate: [count]
- Minor: [count]

---

## ✅ What's Correct (Checklist)

**Structural Integrity:**
- [x] All major sections present
- [x] Section order matches actual prompt
- [x] File numbering sequential (01-NN)

**Variable Placeholders:**
- [x] {{MODEL_NAME}} and {{MODEL_ID}} used correctly
- [x] {{WORKING_DIRECTORY}}, {{PLATFORM}}, {{OS_VERSION}} properly templated
- [x] {{BRANCH_NAME}}, {{GIT_STATUS}}, {{RECENT_COMMITS}} correct
- [x] {{AVAILABLE_SKILLS}} and {{AVAILABLE_SLASH_COMMANDS}} placeholders
- [x] {{CLAUDE_MD_CONTENT}} for user instructions
- [x] No hardcoded user-specific data

**Content Accuracy:**
- [x] Tool definitions verbatim accurate
- [x] Git commit workflow correct
- [x] PR creation workflow correct
- [x] Agent types and descriptions match
- [x] Examples format differences documented

**Total Verified Sections:** [number] / [total]

---

## 🔴 Critical Issues

[ONLY IF FOUND - Otherwise state "None identified"]

### [Issue Name]
- **Severity:** 🔴 CRITICAL
- **Location:** [file:line or section]
- **Problem:** [description]
- **Actual has:** [what's in actual prompt]
- **Documented has:** [what's in documented file]
- **Impact:** [behavioral change]
- **Fix:** [specific action required]

---

## 🟡 Moderate Issues

[ONLY IF FOUND - Otherwise state "None identified"]

### [Issue Name]
- **Severity:** 🟡 MODERATE
- **Problem:** [concise description]
- **Fix:** [action required]

---

## 🟢 Minor Issues

[ONLY IF FOUND - Otherwise state "None identified"]

### [Issue Name]
- **Severity:** 🟢 MINOR
- **Problem:** [concise description]
- **Fix:** [action required]

---

## Recommendations

### Immediate Actions (Critical)
[List only if critical issues exist, otherwise "None required"]

### Updates Needed (Moderate)
[List only if moderate issues exist, otherwise "None required"]

### Future Improvements (Minor)
[List only if minor issues exist, otherwise "None required"]

---

## Verification Checklist

[Only list unchecked items that need fixing]

- [ ] [Item to fix]
- [ ] [Item to fix]

---

## Appendix

**Methodology:** Section-by-section comparison
**Variable Values:** See _CC_SYS_PROMPT_VARIABLES.md
**Limitations:** Runtime variables expected to differ
```

---

### File 2: `_CC_SYS_PROMPT_VARIABLES.md`

Keep concise (~200 lines max):

```markdown
# Claude Code System Prompt - Runtime Variables

**Captured:** [timestamp]
**Directory:** ${1:-00_DOCS/research/claude-code-system-prompt}/

---

## Variable Mapping

| Variable | Value |
|----------|-------|
| `{{MODEL_NAME}}` | [value] |
| `{{MODEL_ID}}` | [value] |
| `{{KNOWLEDGE_CUTOFF}}` | [value] |
| `{{WORKING_DIRECTORY}}` | [value] |
| `{{IS_GIT_REPO}}` | [value] |
| `{{PLATFORM}}` | [value] |
| `{{OS_VERSION}}` | [value] |
| `{{TODAY_DATE}}` | [value] |
| `{{BRANCH_NAME}}` | [value] |
| `{{MAIN_BRANCH}}` | [value] |

---

## Git Status

```
[git status output]
```

## Recent Commits

```
[recent commits or "none"]
```

---

## Skills ([count])

[Bulleted list with name, location, description]

---

## Slash Commands ([count])

[Bulleted list with name and description - first 10, then "And [N] more"]

---

## MCP Tools ([count])

[Bulleted list]

---

## User Custom Instructions

**Global CLAUDE.md:** [Present/Not Present]

**Summary:** [1-2 sentence summary of key themes]

---

## Auto-Approved Tools

[Comma-separated list]

---

## Environment Snapshot

```
[key environment values]
```

---

**Note:** Values reflect state at timestamp above.
**Related:** _GAP_ANALYSIS.md for structural analysis
```

---

## Important Notes

1. **Variable handling**: `{{VARIABLE}}` in documented vs actual value in running prompt is CORRECT - don't flag as issue
2. **Generate BOTH files**: Gap analysis (structural) AND variables (runtime)
3. **Be CONCISE for correct items**: Use checkboxes, not paragraphs
4. **Be DETAILED for problems**: Exact quotes, file locations, impacts
5. **Verify first**: If pre-execution shows errors, stop and report

## Success Criteria

**_GAP_ANALYSIS.md** should:
- Show status at a glance (✅/⚠️/🔴)
- List correct items as simple checklist
- Detail only the problems found
- Provide actionable fixes

**_CC_SYS_PROMPT_VARIABLES.md** should:
- Capture all {{PLACEHOLDERS}} → values
- Be concise (~200 lines)
- Enable runtime state tracking

## Final Instructions

If pre-execution shows errors, STOP and report - cannot proceed without source file.

Otherwise, generate BOTH complete files now with CONCISE FORMAT:
1. `${1:-00_DOCS/research/claude-code-system-prompt}/_GAP_ANALYSIS.md` - structural gaps (concise for correct, detailed for problems)
2. `${1:-00_DOCS/research/claude-code-system-prompt}/_CC_SYS_PROMPT_VARIABLES.md` - runtime snapshot (concise)
