import * as React from "react"
import { cn } from "@repo/ui/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否启用 hover 阴影效果，默认 true */
  hoverable?: boolean
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card text-card-foreground p-3",
        hoverable && "transition-shadow duration-300 ease-in-out hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-base font-medium", className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2", className)}
      {...props}
    />
  )
}