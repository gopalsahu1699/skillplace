const { createClient } = require('@supabase/supabase-js');

// Load env vars
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

// Remove trailing /rest/v1/ if present (Supabase client adds it automatically)
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  console.log('🌱 Starting Supabase seed...');

  // Clear existing data (in correct order for FK constraints)
  console.log('Clearing existing data...');
  await supabase.from('partners').delete().neq('id', '');
  await supabase.from('testimonials').delete().neq('id', '');
  await supabase.from('courses').delete().neq('id', '');
  await supabase.from('categories').delete().neq('id', '');

  // Insert Categories
  console.log('Inserting categories...');
  const categories = [
    { name: 'Civil Engineering', slug: 'civil-engineering', description: 'Civil engineering courses for diploma and B.Tech students', icon: 'Building2', order_index: 1, is_active: true },
    { name: 'Mechanical Engineering', slug: 'mechanical-engineering', description: 'Mechanical engineering courses for diploma and B.Tech students', icon: 'Wrench', order_index: 2, is_active: true },
    { name: 'Electrical Engineering', slug: 'electrical-engineering', description: 'Electrical engineering courses for diploma and B.Tech students', icon: 'Zap', order_index: 3, is_active: true },
    { name: 'Electronics', slug: 'electronics', description: 'Electronics engineering courses for diploma and B.Tech students', icon: 'Cpu', order_index: 4, is_active: true },
  ];

  const { data: insertedCategories, error: catError } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (catError) {
    console.error('Category insert error:', catError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedCategories.length} categories`);

  // Build category slug-to-id map
  const catMap = {};
  for (const cat of insertedCategories) {
    catMap[cat.slug] = cat.id;
  }

  // Insert Courses
  console.log('Inserting courses...');
  const courses = [
    // Civil
    { category_id: catMap['civil-engineering'], title: 'AutoCAD Civil', slug: 'autocad-civil', description: 'Master AutoCAD for civil engineering drawings and plans. Learn 2D drafting, 3D modeling, and professional civil engineering workflows.', short_description: 'Complete AutoCAD training for civil engineers', price: 4999, discount_price: 3999, duration_hours: 40, level: 'beginner', is_featured: true, is_active: true },
    { category_id: catMap['civil-engineering'], title: 'Quantity Survey', slug: 'quantity-survey', description: 'Learn quantity surveying for construction projects. Covers measurement, estimation, and billing.', short_description: 'Professional quantity surveying', price: 5499, discount_price: 4499, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['civil-engineering'], title: 'Billing & Estimation', slug: 'billing-estimation', description: 'Master billing and estimation in construction projects.', short_description: 'Billing and estimation mastery', price: 5499, discount_price: 4499, duration_hours: 30, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['civil-engineering'], title: 'BOQ Preparation', slug: 'boq-preparation', description: 'Learn Bill of Quantities preparation for tendering and project management.', short_description: 'BOQ and tendering skills', price: 4999, discount_price: 3999, duration_hours: 25, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['civil-engineering'], title: 'Excel for Engineers', slug: 'excel-for-engineers', description: 'Essential Excel skills for engineering calculations, data analysis, and reports.', short_description: 'Excel for engineering', price: 2999, discount_price: 1999, duration_hours: 20, level: 'beginner', is_featured: false, is_active: true },
    { category_id: catMap['civil-engineering'], title: 'Site Execution Basics', slug: 'site-execution-basics', description: 'Basics of site execution and construction management.', short_description: 'Site execution fundamentals', price: 5999, discount_price: 4999, duration_hours: 35, level: 'beginner', is_featured: false, is_active: true },
    // Mechanical
    { category_id: catMap['mechanical-engineering'], title: 'AutoCAD Mechanical', slug: 'autocad-mechanical', description: 'AutoCAD for mechanical engineering drawings and assembly design.', short_description: 'Professional mechanical CAD', price: 4999, discount_price: 3999, duration_hours: 40, level: 'intermediate', is_featured: true, is_active: true },
    { category_id: catMap['mechanical-engineering'], title: 'SolidWorks', slug: 'solidworks', description: '3D CAD modeling with SolidWorks for mechanical design and simulation.', short_description: 'Professional 3D CAD training', price: 5999, discount_price: 4999, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['mechanical-engineering'], title: 'GD&T', slug: 'gdt', description: 'Geometric Dimensioning and Tolerancing for precision engineering.', short_description: 'GD&T for engineers', price: 5499, discount_price: 4499, duration_hours: 30, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['mechanical-engineering'], title: 'Industrial Drawing', slug: 'industrial-drawing', description: 'Reading and creating industrial drawings and blueprints.', short_description: 'Industrial drawing reading', price: 4999, discount_price: 3999, duration_hours: 30, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['mechanical-engineering'], title: 'Design Basics', slug: 'design-basics', description: 'Fundamentals of mechanical design and engineering principles.', short_description: 'Mechanical design foundations', price: 3999, discount_price: 2999, duration_hours: 25, level: 'beginner', is_featured: false, is_active: true },
    { category_id: catMap['mechanical-engineering'], title: 'NC Programming', slug: 'nc-programming', description: 'CNC programming for manufacturing and machining operations.', short_description: 'CNC programming mastery', price: 6999, discount_price: 5999, duration_hours: 45, level: 'advanced', is_featured: false, is_active: true },
    // Electrical
    { category_id: catMap['electrical-engineering'], title: 'AutoCAD Electrical', slug: 'autocad-electrical', description: 'AutoCAD for electrical engineering drawings and schematics.', short_description: 'Electrical CAD design', price: 4999, discount_price: 3999, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['electrical-engineering'], title: 'Estimation & Costing', slug: 'estimation-costing', description: 'Electrical estimation and costing for projects.', short_description: 'Electrical project costing', price: 5499, discount_price: 4499, duration_hours: 30, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['electrical-engineering'], title: 'Panel Designing', slug: 'panel-designing', description: 'Electrical panel design and wiring for industrial applications.', short_description: 'Panel design expertise', price: 5999, discount_price: 4999, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['electrical-engineering'], title: 'Electrical Basics', slug: 'electrical-basics', description: 'Fundamentals of electrical engineering for beginners.', short_description: 'Electrical engineering foundations', price: 3999, discount_price: 2999, duration_hours: 25, level: 'beginner', is_featured: false, is_active: true },
    { category_id: catMap['electrical-engineering'], title: 'Project Work', slug: 'electrical-project-work', description: 'Real-world electrical engineering project.', short_description: 'Hands-on electrical project', price: 6999, discount_price: 5999, duration_hours: 45, level: 'advanced', is_featured: false, is_active: true },
    // Electronics
    { category_id: catMap['electronics'], title: 'PCB Design Basics', slug: 'pcb-design-basics', description: 'Learn PCB design fundamentals using industry-standard tools.', short_description: 'Foundation of PCB design', price: 4499, discount_price: 3499, duration_hours: 30, level: 'beginner', is_featured: true, is_active: true },
    { category_id: catMap['electronics'], title: 'Embedded Systems', slug: 'embedded-systems', description: 'Master embedded systems programming and hardware interfacing.', short_description: 'Embedded systems development', price: 5999, discount_price: 4999, duration_hours: 40, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['electronics'], title: 'Industrial Electronics', slug: 'industrial-electronics', description: 'Industrial electronics and automation systems.', short_description: 'Industrial automation', price: 5499, discount_price: 4499, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true },
    { category_id: catMap['electronics'], title: 'Microcontroller Basics', slug: 'microcontroller-basics', description: 'Microcontroller programming basics for embedded applications.', short_description: 'Microcontroller programming', price: 4499, discount_price: 3499, duration_hours: 30, level: 'beginner', is_featured: false, is_active: true },
    { category_id: catMap['electronics'], title: 'Project Work', slug: 'electronics-project-work', description: 'Real-world electronics engineering project.', short_description: 'Hands-on electronics project', price: 6999, discount_price: 5999, duration_hours: 45, level: 'advanced', is_featured: false, is_active: true },
  ];

  const { data: insertedCourses, error: courseError } = await supabase
    .from('courses')
    .insert(courses)
    .select();

  if (courseError) {
    console.error('Course insert error:', courseError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedCourses.length} courses`);

  // Insert Partners
  console.log('Inserting partners...');
  const partners = [
    { name: 'Autommensor Automation Pvt Ltd', short: 'Autommensor', description: 'Industrial automation & control systems', type: 'Sponsor', logo: 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Logo%20for%20Automensor.png', color: 'bg-blue-600', display_order: 1, is_active: true },
    { name: 'Dozert AI', short: 'Dozert', description: 'AI-powered technology solutions', type: 'Sponsor', logo: 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Dozer%20ai.png', color: 'bg-violet-600', display_order: 2, is_active: true },
    { name: 'Himanshu Construction', short: 'Himanshu', description: 'Civil construction & infrastructure', type: 'Sponsor', logo: 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Himanshu.png', color: 'bg-amber-600', display_order: 3, is_active: true },
  ];

  const { data: insertedPartners, error: partnerError } = await supabase
    .from('partners')
    .insert(partners)
    .select();

  if (partnerError) {
    console.error('Partner insert error:', partnerError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedPartners.length} partners`);

  // Insert Testimonials
  console.log('Inserting testimonials...');
  const testimonials = [
    { student_name: 'Rahul Verma', course_name: 'SolidWorks', rating: 5, review: 'Amazing practical training! Got placed in a top mechanical company within 2 months of completing the course.', is_featured: true, is_active: true },
    { student_name: 'Priya Sharma', course_name: 'AutoCAD Civil', rating: 5, review: 'The hands-on approach and real project experience made all the difference. Now working as a site engineer.', is_featured: true, is_active: true },
    { student_name: 'Amit Patel', course_name: 'PLC Programming', rating: 4, review: 'Great instructors with industry knowledge. The placement assistance is genuine.', is_featured: true, is_active: true },
    { student_name: 'Sneha Gupta', course_name: 'PCB Design', rating: 5, review: 'From zero knowledge to designing my own PCBs — all thanks to Skillplace Academy!', is_featured: false, is_active: true },
    { student_name: 'Vikram Singh', course_name: 'Electrical Basics', rating: 4, review: 'The hybrid model gave me flexibility while still getting hands-on lab experience. Highly recommend!', is_featured: false, is_active: true },
  ];

  const { data: insertedTestimonials, error: testError } = await supabase
    .from('testimonials')
    .insert(testimonials)
    .select();

  if (testError) {
    console.error('Testimonial insert error:', testError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedTestimonials.length} testimonials`);

  console.log('\n🎉 Seed completed successfully!');
}

seed().catch(console.error);
