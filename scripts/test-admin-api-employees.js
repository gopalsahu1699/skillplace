const https = require('http');
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let anonKey = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) anonKey = trimmed.split('=').slice(1).join('=').trim();
}

function apiCall(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
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
  // Test the /api/admin route exactly as the client calls it
  const newEmp = JSON.stringify({
    name: 'Test Via API',
    email: 'testviaapi@skillplace.academy',
    phone: '9999999999',
    role: 'instructor',
    department: 'civil',
    bio: 'test',
    photo_url: null,
    is_active: true,
  });
  
  // POST to create employee
  const createResult = await apiCall('/api/admin?table=employees', 'POST', newEmp);
  console.log('API CREATE:', createResult.status, createResult.data);
  
  // PUT to update employee - need an ID
  const updateResult = await apiCall('/api/admin?table=employees&id=a977f814-fa6e-4b32-90d8-ed801be3d5ca', 'PUT', JSON.stringify({ name: 'Test Via API Updated' }));
  console.log('API UPDATE:', updateResult.status, updateResult.data);
  
  // POST to create permission
  const perm = JSON.stringify({
    employee_id: 'a977f814-fa6e-4b32-90d8-ed801be3d5ca',
    can_manage_courses: true,
    can_manage_programs: true,
    can_manage_enrollments: true,
    can_manage_students: true,
    can_manage_content: true,
    can_manage_payments: false,
    can_manage_leads: false,
    can_manage_employees: false,
  });
  
  const permResult = await apiCall('/api/admin?table=employee_permissions', 'POST', perm);
  console.log('API CREATE PERM:', permResult.status, permResult.data);
}

main().catch(e => console.log('ERROR:', e.message));
