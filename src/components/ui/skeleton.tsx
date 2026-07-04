import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer",
        "motion-safe:animate-shimmer motion-reduce:animate-pulse",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
