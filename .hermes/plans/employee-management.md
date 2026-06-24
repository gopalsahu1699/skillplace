# Add Employee Role & Admin Employee Management

## Goal
Add an "employee" role to the system. Admins can manage employees (create, view, edit, delete). Employees can access the admin panel with limited permissions (view students, courses, leads — but cannot manage employees or delete data).

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text

## Already Done (in previous step)
- ✅ Updated `types/index.ts` — added `'employee'` to role union
- ✅ Updated `admin-place/layout.tsx` — allows admin + employee
- ✅ Updated `middleware.ts` — allows admin + employee
- ✅ Updated `AdminSidebar.tsx` — added Employees link (admin-only)

## Tasks

### 1. Create Employee Management Page — `src/app/admin-place/employees/page.tsx`

Create a full CRUD employee management page:

**Header:**
- Title: "Employee Management"
- "Add Employee" button

**Employee Table:**
- Columns: Name, Email, Phone, Role (badge), Status (active/inactive toggle), Actions (Edit, Delete)
- Search bar to filter employees
- Show total count

**Add/Edit Employee Modal/Dialog:**
- Full Name (required)
- Email (required)
- Phone (optional)
- Role selector: "employee" or "admin" (default employee)
- Status: Active/Inactive toggle
- Save / Cancel buttons

**Delete Confirmation:**
- Confirm dialog before deleting
- Show employee name in confirmation message

**Data handling:**
- Fetch employees from `profiles` table where role is 'employee' or 'admin'
- Use Supabase client for CRUD operations
- After any change, refresh the list

**Access control:**
- Only admin users can see the Employees link in sidebar
- Employee users should NOT see the Employees link (they can't manage other employees)
- Pass `isAdmin` prop from layout to control visibility

### 2. Update Admin Layout — `src/app/admin-place/layout.tsx`

Update the layout to pass `isAdmin` prop to AdminSidebar:
- Import AdminSidebar with prop
- Pass `isAdmin={adminUser?.role === 'admin'}` to AdminSidebar

### 3. Update Admin Sidebar — `src/components/layout/AdminSidebar.tsx`

Already updated to accept `isAdmin` prop. Verify it works correctly.

### 4. Create Employee Account Script — `scripts/create-employee.mjs`

Create a script to create employee accounts:
- Accept email, name, password as arguments or use hardcoded defaults
- Create auth user via `supabase.auth.admin.createUser()`
- Create profile with role 'employee'
- Log success

### 5. Update RLS Policies — `scripts/rls-employee.sql`

Add policies for employee role:
- Employees can view all profiles (for student management)
- Employees can update their own profile
- Only admins can change roles (admin-only policy for role updates)

### 6. Update Admin Dashboard — `src/app/admin-place/page.tsx`

Add employee count to dashboard stats:
- Show "Total Employees" stat card
- Show recent employee additions

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use existing UI components from `src/components/ui/`
- Table with hover rows
- Modal dialogs for add/edit
- Status badges: green for active, gray for inactive
- Role badges: blue for admin, purple for employee
- Responsive design

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT modify database schema (tables already exist)
- Do NOT change Supabase client files

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Admin can create/edit/delete employees
- Employee can access admin panel but cannot see Employees management link
