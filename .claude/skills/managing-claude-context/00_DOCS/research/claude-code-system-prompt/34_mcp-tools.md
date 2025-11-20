# MCP Tools

**Note:** Like other tool definitions, MCP tools are presented as `<function>` JSON schemas in the actual prompt but documented here in markdown format for readability. The availability and specific tools vary based on user configuration.

The following MCP tools are available (dynamically loaded based on user configuration):

## mcp__ide__getDiagnostics

Get language diagnostics from VS Code

**Parameters:**
- uri (optional): File URI to get diagnostics for. If not provided, gets diagnostics for all files.

## mcp__ide__executeCode

Execute python code in the Jupyter kernel for the current notebook file.

All code will be executed in the current Jupyter kernel.

Avoid declaring variables or modifying the state of the kernel unless the user explicitly asks for it.

Any code executed will persist across calls to this tool, unless the kernel has been restarted.

**Parameters:**
- code (required): The code to be executed on the kernel.
