const https = require('https');
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let serviceKey = '';
let supabaseUrl = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = trimmed.split('=').slice(1).join('=').trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = trimmed.split('=').slice(1).join('=').trim();
}

const urlObj = new URL(supabaseUrl);

function query(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
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
      res.on('end', () => resolve({status: res.statusCode, data: data.substring(0, 300)}));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Test with branches(name) - exact column name
  const result1 = await query('/rest/v1/courses?select=*,branches(name)&limit=2');
  console.log('WITH branches(name):', result1.status, result1.data.substring(0, 200));
  
  // Test with branches(*) - what the API would generate if join was just 'branches'
  const result2 = await query('/rest/v1/courses?select=*,branches(*)&limit=2');
  console.log('WITH branches(*):', result2.status, result2.data.substring(0, 200));
}

main().catch(e => console.log('ERROR:', e.message));
