# Fix Permissions Not Showing in Employee Dialog

## Issue
When opening the permissions dialog for an employee, all toggles show OFF (gray) even though permissions are saved in the database. The already-granted permissions don't show as green.

## Root Cause
In `fetchEmployees()` (line 60), the call is:
```ts
const data = await getRecords('employees')
```
This does NOT join the `employee_permissions` table. So `employee.employee_permissions` is always `undefined`, and `handlePermissions()` defaults all permissions to `false`.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Modify
`src/app/admin-place/employees/page.tsx`

## Tasks

### 1. Add join to fetchEmployees
Change line 60 from:
```ts
const data = await getRecords('employees')
```
to:
```ts
const data = await getRecords('employees', undefined, undefined, 'employee_permissions(*)')
```

This will fetch each employee with their associated permissions joined.

### 2. Update the Employee type
The `Employee` interface already has `employee_permissions?: EmployeePermission` (optional single object). But the Supabase join with `employee_permissions(*)` returns an **array**. 

Fix: Change the type to be an array, OR adjust the join to not use `*` (which returns array) and instead use a singular relation name.

**Better approach:** Since the `employee_permissions` table has a unique constraint on `employee_id` (one permission per employee), the join will return an array with one element. Update the code to handle this:

In `handlePermissions`, change:
```ts
const p = employee.employee_permissions
```
to:
```ts
const p = Array.isArray(employee.employee_permissions) 
  ? employee.employee_permissions[0] 
  : employee.employee_permissions
```

And in `savePermissions`, similarly handle the array case.

### 3. Update the Employee type
Change in `src/types/index.ts`:
```ts
employee_permissions?: EmployeePermission
```
to:
```ts
employee_permissions?: EmployeePermission[]
```

Then update all references in `employees/page.tsx` to use `[0]` when accessing.

### 4. Alternative simpler fix (preferred)
If changing the type is too invasive, use a singular join without `(*)`:
```ts
const data = await getRecords('employees', undefined, undefined, 'employee_permissions')
```

This might return a single object instead of an array if Supabase detects a 1:1 relationship. But this depends on the FK direction.

**Simplest fix:** Keep the type as `EmployeePermission` (singular) and use:
```ts
const p = Array.isArray(employee.employee_permissions) 
  ? employee.employee_permissions[0] 
  : employee.employee_permissions
```

This handles both cases.

## DO NOT
- Do NOT git push
- Do NOT change the database schema
- Do NOT change the permissions dialog UI (toggles are already fixed)

## After Completion
- Run `npx tsc --noEmit` to verify no type errors
- Test: Open employees page → click permissions on an employee who has permissions → toggles should show green for granted permissions
