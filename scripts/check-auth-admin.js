
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let serviceKey = '';
let anonKey = '';
let supabaseUrl = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = trimmed.split('=').slice(1).join('=').trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) anonKey = trimmed.split('=').slice(1).join('=').trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = trimmed.split('=').slice(1).join('=').trim();
}

const https = require('https');

// Try Supabase Management API (port 6543 or /rest/v1/ with service key for auth)
// Actually, the auth admin endpoint is at /auth/v1/admin/users with service key
function query(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      path: path,
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data}));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const urlObj = new URL(supabaseUrl);
  
  // Try admin auth users endpoint
  const resp1 = await query(urlObj.hostname, '/auth/v1/admin/users');
  console.log('ADMIN USERS:', resp1.status, resp1.data.substring(0, 300));
  
  // Try with port 6543 (Supavisor/PgBouncer)
  const resp2 = await query(urlObj.hostname, '/rest/v1/profiles?select=*&limit=5');
  console.log('PROFILES WITH SERVICE KEY:', resp2.status, resp2.data.substring(0, 300));
}

main().catch(e => console.log('ERROR:', e.message));
