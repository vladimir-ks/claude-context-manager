# BashOutput Tool Definition

## Description

- Retrieves output from a running or completed background bash shell
- Takes a shell_id parameter identifying the shell
- Always returns only new output since the last check
- Returns stdout and stderr output along with shell status
- Supports optional regex filtering to show only lines matching a pattern
- Use this tool when you need to monitor or check the output of a long-running shell
- Shell IDs can be found using the /bashes command

## Parameters

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false,
  "properties": {
    "bash_id": {
      "description": "The ID of the background shell to retrieve output from",
      "type": "string"
    },
    "filter": {
      "description": "Optional regular expression to filter the output lines. Only lines matching this regex will be included in the result. Any lines that do not match will no longer be available to read.",
      "type": "string"
    }
  },
  "required": ["bash_id"],
  "type": "object"
}
```