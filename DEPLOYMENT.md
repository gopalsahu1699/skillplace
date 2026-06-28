# Deployment — Skillplace Academy

## Pre-Deployment Checklist

### Code
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] All linting errors fixed (`npm run lint`)
- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console.log statements
- [ ] No TODO/FIXME markers
- [ ] No hardcoded secrets

### Database
- [ ] All .sql files reviewed
- [ ] Tested in preview environment
- [ ] Backup taken
- [ ] RLS policies updated
- [ ] Indexes added for new queries

### Security
- [ ] Auth checks on all API routes
- [ ] Input validation (zod) on all POST/PUT
- [ ] Rate limiting on sensitive routes
- [ ] Security headers configured
- [ ] CSP configured

### Performance
- [ ] Core Web Vitals passing
- [ ] Images optimized (AVIF/WebP, lazy load)
- [ ] Heavy modules lazy loaded
- [ ] Bundle size checked
- [ ] API response times < 200ms

### SEO
- [ ] All pages have metadata
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Structured data added
- [ ] OG images generated

### Accessibility
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Focus states visible
- [ ] Color contrast WCAG AA
- [ ] Skip navigation link

## Deployment Steps

### 1. Prepare
```bash
# Ensure clean working tree
git status

# Create release branch
git checkout -b release/v1.x.x

# Install dependencies
npm install

# Run full check
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

### 2. Database Changes
```bash
# Open Supabase SQL Editor
# Run the relevant .sql file(s) from supabase/
# Verify tables/columns exist
# Verify RLS policies active
```

### 3. Deploy to Vercel
```bash
# Push to main (triggers Vercel deploy)
git push origin main

# Or deploy via Vercel CLI
vercel --prod
```

### 4. Post-Deploy Verification
```bash
# Check homepage loads
curl -I https://skillplace.academy

# Check API health
curl https://skillplace.academy/api/session/validate

# Check key pages
curl -I https://skillplace.academy/courses
curl -I https://skillplace.academy/programs
curl -I https://skillplace.academy/about

# Check admin (should redirect)
curl -I https://skillplace.academy/admin-place
```

### 5. Smoke Tests
```bash
# Test login
# Test course browsing
# Test enrollment flow (test mode)
# Test admin panel
# Test video playback
```

### 6. Monitor
```bash
# Check Vercel Analytics for errors
# Check Sentry for exceptions
# Check Supabase dashboard for slow queries
# Monitor Core Web Vitals
```

## Rollback Plan

### If deployment fails:
1. Revert git commit: `git revert HEAD`
2. Push to trigger rollback deploy
3. Verify previous version is live

### If database change causes issues:
1. Restore from backup (Supabase Dashboard)
2. Revert .sql file
3. Re-run corrected SQL

### If API errors spike:
1. Check Sentry for stack traces
2. Check API logs
3. Rollback if needed
4. Fix and redeploy

## Environment URLs
| Environment | URL |
|-------------|-----|
| Production | https://skillplace.academy |
| Preview | https://preview.skillplace.academy |
| Development | http://localhost:3000 |

## Release Cadence
- Bug fixes: As needed (hotfix branch)
- Features: Weekly release
- Breaking changes: Monthly with migration guide
- Security patches: Immediate
