# Claude Code System Prompt Documentation

Exact, verbatim system prompts and instructions from Claude Code for creating compatible skills, commands, and agents.

## Purpose

Ensure new prompts do NOT contradict Claude Code's core instructions by providing the exact wording from the system prompt.

## Golden Rule

**Make Claude SMARTER (domain knowledge), not MORE DETAILED (tool instructions)**

## Usage

1. Review `_INDEX.md` for relevant sections and the "DO NOT CONTRADICT" checklist
2. Read exact wording from numbered files (01-34)
3. Add domain expertise without repeating system instructions
4. Use `{{VARIABLE}}` placeholders for runtime values (see `_variables-reference.md`)

## Build

```bash
./build-system-prompt.sh
```

Generates `CONCATENATED_SYSTEM_PROMPT_COMPLETE.md` from all numbered source files (01-34).

## Structure

- `_INDEX.md`, `_variables-reference.md` - Meta-documentation (excluded from concatenation)
- `01-34_*.md` - System prompt components (concatenated in order)
- `archive/` - Historical research documentation
