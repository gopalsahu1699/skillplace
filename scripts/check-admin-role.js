
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
console.log('URL:', supabaseUrl);
console.log('SERVICE_KEY length:', serviceKey.length);

const https = require('https');
const urlObj = new URL(supabaseUrl);
const options = {
  hostname: urlObj.hostname,
  path: '/rest/v1/profiles?email=eq.admin@skillplace.com&select=id,email,role,full_name',
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + serviceKey,
  }
};
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('RESULT:', data));
});
req.on('error', (e) => console.log('ERROR:', e.message));
req.end();
