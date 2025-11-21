---
metadata:
  status: approved
  version: 1.0
  modules: [prompt-engineering, command-design, agent-design]
  tldr: "The CLEAR framework for prompt engineering with two interpretations: Content-focused (Context, Length, Examples, Audience, Role) and Quality-focused (Concise, Logical, Explicit, Adaptive, Reflective)"
---

# The CLEAR Framework for Prompt Engineering

## Purpose

This reference provides comprehensive guidance on the CLEAR framework, a universal prompt engineering methodology applicable to all Claude Code artifacts: commands, agents, skills, and CLAUDE.md files.

**When to use:** Every time you create or edit any artifact that contains prompts or instructions for AI execution.

## Two Interpretations of CLEAR

The CLEAR acronym has two complementary interpretations, both valuable for prompt engineering. Effective prompts integrate both interpretations.

### Interpretation 1: Content-Focused CLEAR

Emphasizes **what to include** in your prompt:

#### **C - Context**
Provide necessary background information and the broader situation relevant to the request.

**Why it matters:** Helps the model understand the "why" behind your prompt and deliver more relevant responses.

**Examples:**
- ✅ "This command creates API endpoints for a microservices architecture using REST principles"
- ❌ "This command creates endpoints" (lacks context)

**In commands:** Briefings should provide comprehensive context through Context Map sections
**In agents:** System prompts should establish domain expertise and operational context
**In skills:** References should provide domain-specific background knowledge

#### **L - Length**
Clearly specify the desired length of the output.

**Why it matters:** Manages scope and prevents overly brief or unnecessarily verbose responses.

**Examples:**
- ✅ "Generate a 2-3 paragraph summary"
- ✅ "Create comprehensive documentation with examples"
- ✅ "Return a concise one-line explanation"

**In commands:** Specify expected report length and detail level
**In agents:** Define verbosity constraints in system prompt
**In skills:** Document expected output length for procedures

#### **E - Examples**
Include examples of desired output format, style, or content.

**Why it matters:** One of the most effective ways to guide AI behavior. Also known as few-shot prompting.

**Examples:**
- ✅ Provide sample JSON schema for expected output
- ✅ Show example file structure with annotations
- ✅ Include reference implementations

**In commands:** Context Maps provide file:line examples
**In agents:** Manuals show example briefings and reports
**In skills:** References include annotated examples

#### **A - Audience**
Specify the intended audience for the response.

**Why it matters:** Responses for experts differ significantly from those for beginners in tone and technical detail.

**Examples:**
- ✅ "Output for technical architects familiar with microservices"
- ✅ "Explain for non-technical product owners"
- ✅ "Document for junior developers learning the system"

**In commands:** Briefings specify downstream consumer (user, agent, system)
**In agents:** System prompts define communication style for target audience
**In skills:** Documentation tailored to user technical level

#### **R - Role**
Assign a persona or role to the AI.

**Why it matters:** Shapes communication style and perspective adopted by the AI.

**Examples:**
- ✅ "Act as a security architect reviewing for vulnerabilities"
- ✅ "Adopt the role of a helpful teaching assistant"
- ✅ "Function as an expert refactoring specialist"

**In commands:** Establish specialist expertise in opening lines
**In agents:** Define core persona in system prompt frontmatter
**In skills:** Establish domain authority in SKILL.md introduction

---

### Interpretation 2: Quality-Focused CLEAR

Emphasizes **how to structure** your prompt:

#### **C - Concise**
Be as brief and to the point as possible without sacrificing clarity.

**Best practices:**
- Avoid unnecessary words or convoluted sentences
- Use active voice
- Get to the point quickly
- Don't repeat information

**Example:**
- ✅ "Analyze the authentication module for security vulnerabilities"
- ❌ "Please take a look at the authentication module and see if you can find any potential security issues or vulnerabilities that might exist"

#### **L - Logical**
Structure your prompt in a logical manner, especially for complex tasks.

**Best practices:**
- Break down complex requests into coherent steps
- Use numbered lists for sequential procedures
- Group related information together
- Follow natural progression (foundation → details → integration)

**Example:**
```markdown
Phase 1: Load foundational references
Phase 2: Analyze current implementation
Phase 3: Generate recommendations
Phase 4: Create detailed plan
```

#### **E - Explicit**
Be direct and unambiguous in your instructions.

**Best practices:**
- Clearly state what you want the AI to do
- Specify exactly what you expect in output
- Avoid vague terms like "improve" or "optimize" without defining criteria
- Use concrete, measurable requirements

**Example:**
- ✅ "Identify functions with cyclomatic complexity > 10 and suggest refactoring to reduce complexity below 7"
- ❌ "Make the code better"

#### **A - Adaptive**
Be prepared to iterate and refine prompts based on responses.

**Best practices:**
- Prompt engineering is a process of trial and error
- Test commands with various inputs
- Refine based on actual outputs
- Incorporate lessons learned

**In practice:**
- Commands: Test with edge cases, refine briefing structure
- Agents: Iterate system prompts based on report quality
- Skills: Refine references based on usage feedback

#### **R - Reflective**
After receiving a response, reflect on the quality of your prompt.

**Best practices:**
- Consider how to phrase prompts differently for better results
- Document successful patterns
- Learn from suboptimal outputs
- Maintain prompt engineering journal

**In practice:**
- Keep notes on what worked/didn't work
- Update manuals with refined patterns
- Share successful prompt structures with team

---

## Integrating Both Interpretations

**The most effective prompts combine both CLEAR interpretations:**

1. **Content (Interpretation 1)**: Ensure all necessary elements are present
   - Context ✓
   - Length ✓
   - Examples ✓
   - Audience ✓
   - Role ✓

2. **Quality (Interpretation 2)**: Ensure prompt is well-structured
   - Concise ✓
   - Logical ✓
   - Explicit ✓
   - Adaptive ✓
   - Reflective ✓

---

## Additional Best Practices

Beyond CLEAR, these practices significantly improve AI response quality:

### 1. Be Specific and Detailed

**Principle:** The more specific your instructions, the better the AI understands and fulfills your request.

**Examples:**
- ❌ "Write about cars"
- ✅ "Write a 500-word article for a general audience about the impact of electric vehicles on the automotive industry, focusing on environmental benefits and challenges to traditional manufacturers"

### 2. Use Delimiters

**Principle:** Clearly separate different parts of your prompt.

**Effective delimiters:**
- Triple quotes (`"""`)
- Triple backticks (` ``` `)
- XML tags (`<section>...</section>`)
- Markdown headers (`## Section Name`)

**Example:**
```markdown
**INSTRUCTIONS:**
Create a security audit report.

**CONTEXT:**
"""
This is a financial services application handling PII data.
Must comply with SOC 2 requirements.
"""

**OUTPUT FORMAT:**
Return JSON matching Report Contract v2 schema.
```

### 3. Define Output Format

**Principle:** Explicitly state the desired format for output.

**Common formats:**
- Bulleted/numbered lists
- JSON objects with schema
- Markdown tables
- Specific writing styles ("formal academic paper", "casual blog post")
- Report Contract v2 (for agents)

### 4. Break Down Complex Tasks

**Principle:** For multi-step requests, break into smaller sub-tasks.

**Pattern:**
```markdown
Phase 1: Investigation
- Step 1: Analyze existing implementation
- Step 2: Identify patterns

Phase 2: Design
- Step 3: Propose architecture
- Step 4: Create specifications

Phase 3: Implementation
- Step 5: Generate code
- Step 6: Create tests
```

**Benefits:**
- More accurate responses
- Easier to track progress
- Enables sequential thinking (LLMs excel at this)
- Supports TodoWrite workflow integration

### 5. Give "Thinking Time"

**Principle:** For complex reasoning, instruct AI to work step-by-step.

**Effective phrases:**
- "Think step-by-step"
- "Work out your reasoning before giving the final answer"
- "Explain your thought process"
- "Show your work"

**Benefits:**
- More deliberative process
- More accurate conclusions
- Traceable reasoning

### 6. Provide Constraints

**Principle:** If there are things to avoid, state them clearly.

**Examples:**
- "Do not use technical jargon"
- "Avoid discussing deprecated APIs"
- "Never modify files without user approval"
- "Do not include placeholder values"

### 7. Iterate and Experiment

**Principle:** Prompt engineering is an iterative discovery process.

**Approach:**
1. Create initial prompt
2. Test with real inputs
3. Analyze results
4. Refine based on feedback
5. Document successful patterns
6. Repeat

**Don't expect perfection on first try.**

---

## Application to Claude Code Artifacts

### Commands

**CLEAR in command prompts:**
- **Context:** Load comprehensive briefings with Context Maps
- **Length:** Specify expected report detail level
- **Examples:** Reference similar commands and show example outputs
- **Audience:** Define who consumes command output (user, agent, orchestrator)
- **Role:** Establish specialist expertise in command domain

**Quality practices:**
- Progressive reference loading (Concise)
- Phased execution with TodoWrite (Logical)
- Clear instructions for each phase (Explicit)
- Edit Mode for refinement (Adaptive)
- Manual testing and iteration (Reflective)

### Agents

**CLEAR in agent system prompts:**
- **Context:** Establish domain expertise and operational constraints
- **Length:** Define report verbosity expectations
- **Examples:** Link to manuals with example briefings and reports
- **Audience:** Specify orchestrator or user as consumer
- **Role:** Define core agent persona

**Quality practices:**
- Isolated context (Concise - no pollution)
- Sequential decision-making (Logical)
- Clear success criteria (Explicit)
- Report Contract v2 (Adaptive - structured feedback)
- Integration validation (Reflective)

### Skills

**CLEAR in skill documentation:**
- **Context:** Provide domain background in SKILL.md
- **Length:** Define scope of procedural knowledge
- **Examples:** Include annotated examples in references
- **Audience:** Document technical level required
- **Role:** Establish skill as domain authority

**Quality practices:**
- Progressive disclosure (Concise - load on-demand)
- Structured reference hierarchy (Logical)
- Clear loading instructions (Explicit)
- Version-controlled updates (Adaptive)
- Usage feedback integration (Reflective)

### CLAUDE.md Files

**CLEAR in project context:**
- **Context:** Establish project architecture and conventions
- **Length:** Keep concise, delegate details to references
- **Examples:** Show code patterns and structure
- **Audience:** Define who reads (AI, developers, both)
- **Role:** Establish project standards authority

**Quality practices:**
- Zero-redundancy (Concise)
- Hierarchical organization (Logical)
- Concrete rules and patterns (Explicit)
- Living document (Adaptive)
- Regular review and updates (Reflective)

---

## Integration Checklist

When creating or reviewing any artifact, verify CLEAR integration:

### Content Checklist
- [ ] **Context** provided (background, purpose, domain)
- [ ] **Length** expectations specified
- [ ] **Examples** included or referenced
- [ ] **Audience** identified (technical level, role)
- [ ] **Role** established (persona, expertise)

### Quality Checklist
- [ ] **Concise** - No unnecessary verbosity
- [ ] **Logical** - Well-structured progression
- [ ] **Explicit** - Clear, unambiguous instructions
- [ ] **Adaptive** - Supports iteration and refinement
- [ ] **Reflective** - Incorporates feedback and learning

### Best Practices Checklist
- [ ] Specific and detailed instructions
- [ ] Delimiters used to separate sections
- [ ] Output format explicitly defined
- [ ] Complex tasks broken into phases
- [ ] Constraints clearly stated

---

## Common Pitfalls

### ❌ Insufficient Context
**Problem:** AI lacks background to make informed decisions
**Solution:** Provide comprehensive briefing with domain context

### ❌ Vague Length Requirements
**Problem:** Outputs are too verbose or too brief
**Solution:** Specify expected detail level explicitly

### ❌ No Examples
**Problem:** AI guesses at desired format
**Solution:** Show example outputs or reference implementations

### ❌ Unclear Audience
**Problem:** Tone and detail level mismatched
**Solution:** Define technical level and role of consumer

### ❌ Missing Role Assignment
**Problem:** Generic responses lacking expertise
**Solution:** Establish clear persona and domain authority

### ❌ Overly Verbose Prompts
**Problem:** Key instructions buried in text
**Solution:** Be concise, use formatting to highlight critical points

### ❌ Illogical Structure
**Problem:** Steps out of order, confusing flow
**Solution:** Organize logically, use numbered phases

### ❌ Ambiguous Instructions
**Problem:** AI interprets instructions differently than intended
**Solution:** Be explicit, use concrete criteria

### ❌ Static Prompts
**Problem:** Never improved after initial creation
**Solution:** Iterate based on actual usage and outputs

### ❌ No Reflection
**Problem:** Repeated mistakes, no learning
**Solution:** Document what works, refine based on experience

---

## Related References

- **briefing-and-prompting-philosophy.md** - Comprehensive prompt design principles
- **subagent-design-guide.md** - Applying CLEAR to agent system prompts
- **how-to-prompt-commands.md** - CLEAR in command briefings
- **context-architecture-design.md** - CLEAR in architecture artifacts

---

## Summary

**CLEAR Framework = Universal Prompt Engineering Standard**

**Two interpretations:**
1. **Content:** Context, Length, Examples, Audience, Role (what to include)
2. **Quality:** Concise, Logical, Explicit, Adaptive, Reflective (how to structure)

**Best practice:** Integrate both interpretations in every artifact.

**Result:** High-quality, consistent, effective prompts across all Claude Code artifacts.
