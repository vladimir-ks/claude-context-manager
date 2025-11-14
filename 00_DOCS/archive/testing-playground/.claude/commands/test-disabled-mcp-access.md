---
model: claude-haiku-4-5-20251001
description: Test if requesting MCP tools in frontmatter activates disabled MCP
argument-hint: none
tools: mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot
---

## Test: Accessing Disabled MCP

This command tests if a subagent/command can access MCPs that are configured globally but marked as `disabled: true`.

**Your Task:**
List all tools that start with `mcp__playwright__` or `mcp__context7__`.

If you can see these tools, it means the disabled MCP was loaded for this subagent.
If you cannot see these tools, it means disabled MCPs are truly disabled for subagents too.

Please report your findings.
