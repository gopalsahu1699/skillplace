'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function AdminPagination({ page, totalPages, totalItems, pageSize, onPageChange }: AdminPaginationProps) {
  if (totalItems <= pageSize) return null

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-slate-500">
        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-slate-600 font-medium px-2">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
