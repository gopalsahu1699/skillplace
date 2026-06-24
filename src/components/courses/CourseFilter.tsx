'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
}

interface CourseFilterProps {
  selected: string
  onSelect: (slug: string) => void
}

export default function CourseFilter({ selected, onSelect }: CourseFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('order_index')

      if (data) {
        setCategories([{ id: 'all', name: 'All', slug: 'all' }, ...data])
      }
    }
    fetchCategories()
  }, [])

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
