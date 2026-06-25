# Fix Employee Permissions Join - toLowerCase Error

## Error
`Cannot read properties of undefined (reading 'toLowerCase')` in the filter function.

## Root Cause
The join `employee_permissions` (without `*`) returns a 400 error: "column employees.employee_permissions does not exist". This means Supabase cannot auto-detect the reverse FK relationship from `employees` to `employee_permissions`.

The `employee_permissions(*)` join works but acts as an INNER JOIN, excluding employees without permissions. This causes the data array to be incomplete.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Modify
`src/app/admin-place/employees/page.tsx`

## Tasks

### 1. Fix fetchEmployees to fetch employees and permissions separately
Instead of using a join that doesn't work, fetch data in two steps:

```ts
async function fetchEmployees() {
  setLoading(true)
  const [employeesData, permissionsData] = await Promise.all([
    getRecords('employees'),
    getRecords('employee_permissions'),
  ])
  
  if (employeesData) {
    // Create a map of employee_id -> permissions
    const permMap = new Map()
    if (permissionsData) {
      permissionsData.forEach((p: any) => permMap.set(p.employee_id, p))
    }
    
    // Attach permissions to each employee
    const enriched = employeesData.map((emp: any) => ({
      ...emp,
      employee_permissions: permMap.get(emp.id) || null,
    }))
    
    const sorted = enriched.sort((a: any, b: any) => 
      (a.name || '').localeCompare(b.name || '')
    )
    setEmployees(sorted)
  }
  setLoading(false)
}
```

### 2. Add null safety in filter
Also add null safety in the filter function:
```ts
const filteredEmployees = employees.filter(
  (e) =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
)
```

## DO NOT
- Do NOT git push
- Do NOT change the database schema
- Do NOT change the permissions dialog UI

## After Completion
- Run `npx tsc --noEmit`
- Test: All employees should appear, search should work, permissions dialog should show correct toggles
