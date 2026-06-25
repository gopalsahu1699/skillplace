
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

function query(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      path: path,
      method: method || 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Try to list auth users (Supabase management API)
  const usersResp = await query('/auth/v1/users');
  console.log('AUTH USERS STATUS:', usersResp.status);
  console.log('AUTH USERS DATA:', usersResp.data.substring(0, 500));
}

main().catch(e => console.log('ERROR:', e.message));
