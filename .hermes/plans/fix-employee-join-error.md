# Fix Employee Permissions Join Error

## Error
`Cannot read properties of undefined (reading 'localeCompare')` in `fetchEmployees` at the sort function.

## Root Cause
The Supabase join `employee_permissions(*)` acts as an INNER JOIN — it filters out employees that don't have a permission record. This means employees without permissions are excluded from the result, and the data array may contain gaps.

Additionally, the join returns `employee_permissions` as a single object (not array), so the `Array.isArray()` check added by OpenCode is unnecessary but not the cause of this error.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Modify
`src/app/admin-place/employees/page.tsx`

## Tasks

### 1. Fix the join to use LEFT JOIN behavior
Change the join from `employee_permissions(*)` to just `employee_permissions` (without `*`). In Supabase, a bare relation name without `(*)` performs a LEFT JOIN, returning all employees even if they don't have permissions.

Change line 60 from:
```ts
const data = await getRecords('employees', undefined, undefined, 'employee_permissions(*)')
```
to:
```ts
const data = await getRecords('employees', undefined, undefined, 'employee_permissions')
```

### 2. Handle null employee_permissions
When an employee has no permissions, `employee_permissions` will be `null` (not undefined, not array). The `handlePermissions` function already handles this with `p?.can_manage_courses || false`, so that's fine.

### 3. Remove unnecessary Array.isArray check
Since the join returns a single object (not array), remove the `Array.isArray()` logic added by OpenCode. Revert to the simpler pattern:

In `handlePermissions`:
```ts
const p = employee.employee_permissions
```

In `savePermissions`:
```ts
if (permissionsEmployee.employee_permissions) {
  await updateRecord('employee_permissions', permissionsEmployee.employee_permissions.id, permData)
}
```

### 4. Add null safety in sort
The sort function should be safe regardless:
```ts
const sorted = data.sort((a: Employee, b: Employee) => 
  (a.name || '').localeCompare(b.name || '')
)
```

## DO NOT
- Do NOT git push
- Do NOT change the database schema
- Do NOT change the permissions dialog UI

## After Completion
- Run `npx tsc --noEmit`
- Test: All employees should appear in the list, and permissions dialog should correctly show granted permissions as green toggles
