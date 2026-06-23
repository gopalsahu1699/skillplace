'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Civil Engineering', slug: 'civil-engineering' },
  { name: 'Mechanical', slug: 'mechanical' },
  { name: 'Electrical', slug: 'electrical' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Soft Skills', slug: 'soft-skills' },
]

interface CourseFilterProps {
  selected: string
  onSelect: (slug: string) => void
}

export default function CourseFilter({ selected, onSelect }: CourseFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.slug}
          variant={selected === cat.slug ? 'default' : 'outline'}
          size="sm"
          className={cn(
            selected === cat.slug && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onSelect(cat.slug)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
