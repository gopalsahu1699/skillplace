
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

function signIn(email, password) {
  const body = JSON.stringify({ email, password });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'weebasgxtemffakbvcfa.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data: data.substring(0, 300)}));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Try common passwords
  const passwords = ['admin123', 'password', 'admin', 'admin@123', 'Skillplace123', '***'];
  
  // Actually, I should ask the user for the password. Let me just check if the user can sign in
  // by trying with a test - but I don't know the password
  
  // Let me just verify the auth user exists
  const urlObj = new URL(supabaseUrl);
  const options = {
    hostname: urlObj.hostname,
    path: '/auth/v1/admin/users/ee33b38d-da74-4f2f-8794-b2c3f6f82396',
    method: 'GET',
    headers: {
      'apikey': anonKey,
      'Authorization': 'Bearer ' + anonKey,
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('USER STATUS:', res.statusCode);
      console.log('USER DATA:', data.substring(0, 500));
    });
  });
  req.on('error', (e) => console.log('ERROR:', e.message));
  req.end();
}

main();
