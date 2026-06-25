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
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data: data.substring(0, 500)}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Try to create an employee
  const newEmp = JSON.stringify({
    name: 'Test Employee Delete',
    email: 'test_delete@skillplace.academy',
    phone: '1234567890',
    role: 'instructor',
    department: 'civil',
    bio: 'test',
    photo_url: null,
    is_active: true,
  });
  
  const createResult = await query('/rest/v1/employees', 'POST', newEmp);
  console.log('CREATE EMPLOYEE:', createResult.status, createResult.data);
  
  // Try to update
  const updateResult = await query('/rest/v1/employees?id=eq.acf59d95-5ff1-4944-acd1-6e9d03e35619', 'PATCH', JSON.stringify({ name: 'Sneha Patel Updated' }));
  console.log('UPDATE EMPLOYEE:', updateResult.status, updateResult.data);
  
  // Try to create permission
  const perm = JSON.stringify({
    employee_id: 'acf59d95-5ff1-4944-acd1-6e9d03e35619',
    can_manage_courses: true,
    can_manage_programs: true,
    can_manage_enrollments: true,
    can_manage_students: true,
    can_manage_content: true,
    can_manage_payments: true,
    can_manage_leads: true,
    can_manage_employees: true,
  });
  
  const permResult = await query('/rest/v1/employee_permissions', 'POST', perm);
  console.log('CREATE PERMISSION:', permResult.status, permResult.data);
}

main().catch(e => console.log('ERROR:', e.message));
