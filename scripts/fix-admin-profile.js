
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

function query(hostname, path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      path: path,
      method: method || 'GET',
      headers: {
        'apikey': serviceKey,
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
  const adminUserId = 'ee33b38d-da74-4f2f-8794-b2c3f6f82396';
  
  // Insert admin profile
  const body = JSON.stringify({
    id: adminUserId,
    email: 'admin@skillplace.com',
    full_name: 'Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
  });
  
  const resp = await query(urlObj.hostname, '/rest/v1/profiles', 'POST', body);
  console.log('INSERT STATUS:', resp.status);
  console.log('INSERT RESULT:', resp.data);
}

main().catch(e => console.log('ERROR:', e.message));
