
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
      res.on('end', () => resolve({status: res.statusCode, data: data}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Get students and courses
  const studentsResp = await query('/rest/v1/students?select=id,email,full_name&limit=5');
  const students = JSON.parse(studentsResp.data);
  console.log('STUDENTS:', students.length);

  const coursesResp = await query('/rest/v1/courses?select=id,title,price&limit=5');
  const courses = JSON.parse(coursesResp.data);
  console.log('COURSES:', courses.length);

  // Create sample purchases
  const purchases = [
    { user_id: students[0].id, course_id: courses[0].id, amount: courses[0].price || 4999, currency: 'INR', order_id: 'crs_sample_a1b2c3', cf_order_id: '1001', status: 'completed' },
    { user_id: students[1].id, course_id: courses[1 % courses.length].id, amount: courses[1 % courses.length].price || 5999, currency: 'INR', order_id: 'crs_sample_d4e5f6', cf_order_id: '1002', status: 'completed' },
    { user_id: students[2].id, course_id: courses[2 % courses.length].id, amount: courses[2 % courses.length].price || 7999, currency: 'INR', order_id: 'crs_sample_g7h8i9', cf_order_id: '1003', status: 'pending' },
    { user_id: students[3].id, course_id: courses[0].id, amount: courses[0].price || 4999, currency: 'INR', order_id: 'crs_sample_j0k1l2', cf_order_id: '1004', status: 'completed' },
    { user_id: students[4].id, course_id: courses[1 % courses.length].id, amount: courses[1 % courses.length].price || 5999, currency: 'INR', order_id: 'crs_sample_m3n4o5', cf_order_id: '1005', status: 'failed' },
    { user_id: students[0].id, course_id: courses[2 % courses.length].id, amount: courses[2 % courses.length].price || 7999, currency: 'INR', order_id: 'crs_sample_p6q7r8', cf_order_id: '1006', status: 'completed' },
    { user_id: students[2].id, course_id: courses[0].id, amount: courses[0].price || 4999, currency: 'INR', order_id: 'crs_sample_s9t0u1', cf_order_id: '1007', status: 'refunded' },
  ];

  for (const p of purchases) {
    const result = await query('/rest/v1/purchases', 'POST', JSON.stringify(p));
    console.log('CREATE PURCHASE:', result.status, p.user_id.substring(0, 8), p.status);
  }
}

main().catch(e => console.log('ERROR:', e.message));
