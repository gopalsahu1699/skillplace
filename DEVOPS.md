# DevOps — Skillplace Academy

## Infrastructure

### Hosting
- **Platform:** Vercel (Next.js optimized)
- **Region:** Singapore (closest to India)
- **CDN:** Vercel Edge Network

### Database
- **Provider:** Supabase (PostgreSQL)
- **Region:** Singapore
- **Plan:** Pro (for connection pooling + backups)
- **Backups:** Daily automated + manual before migrations

### Storage
- **Video:** Cloudflare Stream
- **Files/Images:** Supabase Storage
- **CDN:** Cloudflare

### External Services
- **Payments:** Razorpay
- **Email:** Resend (or Supabase Auth emails)
- **Monitoring:** Vercel Analytics + Sentry

## Environment Configuration

### Production (.env.production)
```
NEXT_PUBLIC_SUPABASE_URL=https://weebasgxtemffakbvcfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://skillplace.academy
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_STREAM_DOMAIN=...
CRON_SECRET=...
```

### Preview (.env.preview)
- Same as production but with test Razorpay keys
- Separate Supabase project for staging

## CI/CD Pipeline

### On Pull Request
1. `npm install`
2. `npx tsc --noEmit` (type check)
3. `npm run lint`
4. `npm run test` (unit + integration)
5. `npm run build`
6. Deploy preview environment

### On Merge to Main
1. All PR checks pass
2. `npm run test` (full suite)
3. `npm run build`
4. Deploy to production
5. Run smoke tests
6. Notify team

### Database Migrations
1. Developer updates `supabase/{table}.sql`
2. OWL reviews the SQL
3. Run in Supabase SQL Editor
4. Verify in production
5. Update `DATABASE_RULES.md` if needed

## Monitoring

### Error Tracking (Sentry)
- Capture all 500 errors
- Capture client-side errors
- Alert on error rate spikes

### Performance (Vercel Analytics)
- Core Web Vitals per page
- LCP, FID, CLS tracking
- Alert if metrics degrade

### Uptime
- Monitor /api/health endpoint
- Alert if response > 2s or 5xx

### Database
- Monitor connection pool usage
- Monitor query performance
- Alert on slow queries (> 500ms)

## Security

### Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
```

### Rate Limiting
- Login: 5 attempts / 15 min / IP
- API: 100 requests / min / user
- Webhook: 1000 requests / min / IP

### Secrets
- Rotate keys every 90 days
- Use Vercel env vars (not .env files in repo)
- Never log secrets

## Backup Strategy

### Database
- Daily automated backups (Supabase)
- 7-day retention
- Manual backup before any schema change
- Test restore monthly

### Storage
- Supabase Storage: versioning enabled
- Cloudflare Stream: redundant storage
- Weekly manual backup of critical files

### Disaster Recovery
- RTO: 4 hours
- RPO: 24 hours
- Documented restore procedure
- Test restore quarterly
