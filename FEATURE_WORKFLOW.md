# Feature Workflow — Skillplace Academy

Every feature must complete this pipeline before deployment:

```
Requirement → Research → PRD → TRD → App Flow → UI/UX Brief
→ DB Schema → API Design → Folder Structure → Implementation Plan
→ OpenCode Coding → Code Review → Security Audit → Performance Audit
→ SEO Audit → Accessibility Audit → Testing → Deployment → Monitoring
→ Documentation → Done
```

## Development Gates (must pass before PR)

- [ ] PRD approved
- [ ] TRD complete
- [ ] App flow reviewed
- [ ] UI/UX approved
- [ ] DB schema finalized (per-table .sql file updated)
- [ ] API contracts documented
- [ ] Security review passed
- [ ] Performance review passed
- [ ] SEO/AEO/GEO/LLMO checks passed
- [ ] Accessibility review passed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Deployment checklist complete

## OWL Role

1. **Requirement** — Understand the feature
2. **Research** — Search docs, GitHub, compare solutions
3. **PRD** — Write product requirements
4. **TRD** — Write technical requirements
5. **App Flow** — Map user journeys
6. **UI/UX Brief** — Describe screens
7. **DB Schema** — Update relevant `.sql` file(s) in `supabase/`
8. **API Design** — Document endpoints
9. **Folder Structure** — Plan file organization
10. **Implementation Plan** — Break into tasks
11. **Coding** → **DELEGATE TO OPENCODE**
12. **Review** — Check code quality
13. **Audit** — Security, performance, SEO, a11y
14. **Deploy** — Verify in production
15. **Document** — Update docs

## OpenCode Role

- Receives: TRD + API Design + Folder Structure + Implementation Plan
- Returns: Working code + tests
- Must follow: CODING_STANDARDS.md, API_STANDARDS.md, SECURITY_GUIDE.md
