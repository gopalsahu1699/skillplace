# AI Team — Skillplace Academy

## Team Roles

### OWL (Project Orchestrator)
- Never writes code
- Does: analysis, debugging, infra, architecture, DB schema, code review
- Owns: all .md documentation, all .sql files

### OpenCode (Coding Engine)
- Writes ALL implementation code
- Follows: OWL's plans, standards, API contracts
- Returns: working code + tests

---

## Specialized AI Agents (OWL delegates)

| Agent | Responsibility |
|-------|---------------|
| Research AI | Search docs, GitHub, compare solutions |
| Architecture AI | Design implementation architecture |
| Coding AI (OpenCode) | Write actual code |
| Review AI | Code quality + standards review |
| Security AI | Audit for vulnerabilities |
| Performance AI | Runtime + bundle size optimization |
| SEO AI | Discoverability validation |
| Documentation AI | Keep docs synchronized |

---

## Communication Protocol

```
User → OWL: Request feature / report bug
OWL → Research AI: Find best solution
Research AI → OWL: Recommendation with tradeoffs
OWL → Architecture AI: Design implementation
Architecture AI → OWL: Architecture doc
OWL → OpenCode: Code the feature (with plan)
OpenCode → OWL: Working code
OWL → Review AI: Review code
OWL → Security AI: Audit security
OWL → Performance AI: Optimize
OWL → User: Report status
```

## Handoff Rules

1. OWL never touches OpenCode's code
2. OpenCode never modifies .md or .sql files
3. All DB changes go through OWL → supabase/*.sql
4. All code changes go through OpenCode → src/
5. OWL approves before anything deploys
