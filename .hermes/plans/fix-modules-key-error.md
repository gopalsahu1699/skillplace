# Fix Modules Page — Missing Key Prop Error

## Error
"Each child in a list should have a unique key prop" in `ModulesPage` at `Array.map`.

## Root Cause
The `ModuleCard` component is rendered inside `.map()` in the modules page. While the code has `key={mod.id}`, the error might be from:
1. The `ModuleCard` component itself rendering something internally that React sees as a list
2. Or the compiled code mapping to a different location

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Modify
`src/app/admin-place/content/[courseId]/modules/page.tsx`

## Tasks

### 1. Remove ModuleCard dependency and inline the card
Replace the `ModuleCard` component with inline JSX directly in the `.map()`. This eliminates any possibility of missing keys inside the component.

Replace:
```tsx
{modules.map((mod, idx) => (
  <ModuleCard
    key={mod.id}
    module={mod as Module & { lessons?: Lesson[] }}
    index={idx}
    total={modules.length}
    onSelect={() => {}}
    onEdit={() => openEdit(mod)}
    onDelete={() => {
      setDeletingModule(mod)
      setShowDeleteConfirm(true)
    }}
    onMoveUp={() => handleReorder(mod.id, 'up')}
    onMoveDown={() => handleReorder(mod.id, 'down')}
  />
))}
```

With inline card JSX:
```tsx
{modules.map((mod, idx) => (
  <div
    key={mod.id}
    className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleReorder(mod.id, 'up') }}
          disabled={idx === 0}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleReorder(mod.id, 'down') }}
          disabled={idx === total - 1}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900">{mod.title}</p>
        {mod.description && (
          <p className="text-sm text-slate-500 truncate mt-0.5">{mod.description}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{(mod.lessons || []).length} lesson{(mod.lessons || []).length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEdit(mod)}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setDeletingModule(mod); setShowDeleteConfirm(true) }}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
))}
```

### 2. Add ChevronUp and ChevronDown to imports
```ts
import { ArrowLeft, Plus, ChevronUp, ChevronDown } from 'lucide-react'
```

### 3. Remove ModuleCard import
Remove `import ModuleCard from '@/components/admin/ModuleCard'`

### 4. Remove unused Lesson import
Remove `import type { Module, Lesson } from '@/types'` — or keep only what's needed

## DO NOT
- Do NOT git push
- Do NOT change any other functionality

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- The modules page should render without key warnings
