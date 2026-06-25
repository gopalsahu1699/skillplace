
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

const https = require('https');
const urlObj = new URL(supabaseUrl);

// Simulate the admin API route's join logic
// join=branches(name) -> selectStr = '*,branches(*)'
const selectStr = '*,branches(*)';

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
      res.on('end', () => resolve({status: res.statusCode, data: data.substring(0, 500)}));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Test the join query that the admin API would use
  const result = await query('/rest/v1/courses?select=*,branches(*)&limit=3');
  console.log('JOIN QUERY STATUS:', result.status);
  console.log('JOIN QUERY RESULT:', result.data);
}

main().catch(e => console.log('ERROR:', e.message));
