# Mermaid Diagram Guidelines for CLAUDE.md

## Add this section to your CLAUDE.md:

### Mermaid Diagram Rules

**Diagram Decision Criteria** - Only use diagrams for sufficient complexity:

- Simple linear processes (<5 steps) should be bullet lists, not diagrams
- Diagrams must clarify complex relationships, branches, or parallel flows
- If it can be clearly explained in 3-4 bullet points, don't create a diagram

**When to Use Each Type**:

- **Sequence diagrams**: Multi-party interactions, API flows, system conversations
- **State diagrams**: Status transitions, approval workflows, lifecycle management
- **Flowcharts**: Complex decision trees with multiple branches (use sparingly)
- **Timeline**: Phased projects, implementation roadmaps
- **Journey**: User experience with touchpoints and emotions

**Critical Formatting Rules**:

- **Use vertical orientation (TB/TD)** - Never use LR for complex flows (breaks MD rendering)
- **Keep text concise** - Max 3-5 words per node
- **Limit horizontal width** - Must render properly in IDE markdown preview
- **Break up complexity** - Multiple focused diagrams > one overwhelming diagram
- **No code in documentation** - User is Product Owner with junior technical level
