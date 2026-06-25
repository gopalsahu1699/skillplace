## Task: Fix admin@skillplace.com admin access

### Overview
The admin user `admin@skillplace.com` cannot login to admin-place. Need to check the database state and fix the admin user's records to ensure they have proper admin access.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`

### Steps

1. **Check if admin@skillplace.com exists in auth users and profiles table**
   Run this SQL via Supabase REST API to check:
   ```bash
   # Check profiles table
   curl "https://weebasgxtemffakbvcfa.supabase.co/rest/v1/profiles?email=eq.admin@skillplace.com"      -H "apikey: <_REDACTED>      -H "Authorization: Bearer <_REDACTED>"
   ```

2. **Check if admin@skillplace.com exists in employees table**
   ```bash
   curl "https://weebasgxtemffakbvcfa.supabase.co/rest/v1/employees?email=eq.admin@skillplace.com"      -H "apikey: <_REDACTED>      -H "Authorization: Bearer <_REDACTED>"
   ```

3. **Based on results, fix the issue:**
   - If user exists in auth but NOT in profiles → insert profile with role='admin'
   - If user exists in profiles but role is wrong → update to role='admin'
   - If user exists in employees but role is wrong → update to role='admin'
   - If user doesn't exist in auth at all → create auth user + profile + employees records

4. **Also check the user_sessions table** to see if there's a stale session:
   ```bash
   curl "https://weebasgxtemffakbvcfa.supabase.co/rest/v1/user_sessions?select=*&user_id=eq.<user_id>"      -H "apikey: <_REDACTED>      -H "Authorization: Bearer <_REDACTED>"
   ```

5. **If there are stale/inactive sessions for the admin**, delete them so a fresh session can be created on next login:
   ```bash
   curl -X DELETE "https://weebasgxtemffakbvcfa.supabase.co/rest/v1/user_sessions?user_id=eq.<user_id>"      -H "apikey: <_REDACTED>      -H "Authorization: Bearer <_REDACTED>"
   ```

### Environment Variables
- Read `.env.local` to get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- The Supabase URL is: `https://weebasgxtemffakbvcfa.supabase.co`

### DO NOT
- Do NOT modify any code files
- Do NOT git push
