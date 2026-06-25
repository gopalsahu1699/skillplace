
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let anonKey = '';
let supabaseUrl = '';
for (const l of lines) {
  const trimmed = l.trim();
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
        'Authorization': 'Bearer ' + anonKey,
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
  // Check profiles via anon key (what the browser uses)
  const profiles = await query('/rest/v1/profiles?select=*&limit=5');
  console.log('PROFILES VIA ANON:', profiles.status, profiles.data.substring(0, 500));
  
  // Check if there's an RLS policy blocking reads
  const courses = await query('/rest/v1/courses?select=*&limit=2');
  console.log('COURSES VIA ANON:', courses.status, courses.data.substring(0, 200));
}

main().catch(e => console.log('ERROR:', e.message));
