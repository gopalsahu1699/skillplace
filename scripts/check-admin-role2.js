
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
const urlObj = new URL(supabaseUrl);

function query(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      path: path,
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': 'Bearer ' + serviceKey,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // 1. Check all profiles
  const allProfiles = await query('/rest/v1/profiles?select=id,email,role,full_name&limit=20');
  console.log('ALL PROFILES:', allProfiles);
  
  // 2. Try auth users endpoint
  const users = await query('/auth/v1/users?email=admin@skillplace.com');
  console.log('AUTH USERS:', users);
}

main().catch(e => console.log('ERROR:', e.message));
