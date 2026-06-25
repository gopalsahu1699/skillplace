# Fix React Key Warning in AdminCoursesPage

## Issue
Console error: "Each child in a list should have a unique 'key' prop" in `AdminCoursesPage`.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## Analysis
The file `src/app/admin-place/courses/page.tsx` has proper `key` props on all direct `.map()` calls (line 234 branches, line 283 courses). The warning likely comes from a child component or a list rendered inside the table cells.

## Tasks

1. Read `src/app/admin-place/courses/page.tsx` carefully.
2. Search for ANY `.map(` calls in the file that might be missing a `key` prop.
3. Also check if any imported child component renders lists without keys — particularly look at any component used inside the table rows.
4. Check if the `Badge` component or any UI component renders a list internally.
5. Look for patterns like `array.map(...)` inside JSX that might be missing `key`.
6. Also check `src/lib/admin-api.ts` — if it returns data that includes nested arrays rendered as lists.
7. Fix ALL missing key props.
8. Verify with `npx tsc --noEmit` that there are no TypeScript errors.

## DO NOT
- Do NOT git push
- Do NOT change any functionality — only add missing `key` props
- Do NOT modify files outside the scope of fixing this warning

## After Completion
- Run `npx tsc --noEmit` to verify no type errors
- Report what was changed and where the missing key was
