# Fix Permissions Dialog UI in Employee Management

## Issue
The permissions dialog in `/admin-place/employees` uses plain checkboxes that don't clearly show which permissions are already granted. User wants toggle switches (on/off) with visual distinction.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Modify
`src/app/admin-place/employees/page.tsx` — lines 533-580 (Permissions Dialog section)

## Tasks

### 1. Replace checkboxes with toggle switches
Replace the `<input type="checkbox">` in the permissions dialog with a toggle switch UI. The toggle should:
- Use a sliding pill design (rounded full, ~48px wide, ~26px tall)
- Show green background when ON (permission granted)
- Show gray background when OFF (permission not granted)
- Include a small white circle that slides left/right
- Be clickable anywhere on the toggle row

### 2. Add visual indicator for current state
Each permission row should clearly show its current state:
- ON: green toggle pill + label text in normal weight
- OFF: gray toggle pill + label text in muted color
- The toggle should reflect the actual `permData[perm.key]` value (already populated from `employee.employee_permissions`)

### 3. Keep the same data flow
- `permData` state still tracks the toggled values
- `savePermissions()` function still works the same
- `handlePermissions()` still loads existing permissions from `employee.employee_permissions`
- Only change the UI from checkboxes to toggle switches

### 4. Toggle switch design (Tailwind CSS only)
```tsx
<button
  type="button"
  onClick={() => setPermData({ ...permData, [perm.key]: !permData[perm.key] })}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    permData[perm.key] ? 'bg-green-600' : 'bg-slate-300'
  }`}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      permData[perm.key] ? 'translate-x-6' : 'translate-x-1'
    }`}
  />
</button>
```

### 5. Permission row layout
Each row should be:
- A clickable area (the whole row toggles the permission)
- Label on the left, toggle switch on the right
- Subtle border, hover effect
- If permission is ON: green border tint
- If permission is OFF: gray border

## DO NOT
- Do NOT git push
- Do NOT change the data flow or state management
- Do NOT change the `savePermissions()` function
- Do NOT change the `handlePermissions()` function
- Do NOT add new dependencies — use only Tailwind CSS classes

## After Completion
- Run `npx tsc --noEmit` to verify no type errors
- The permissions dialog should show toggle switches that clearly indicate granted/not-granted state
