import type React from "react"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700",
    destructive: "bg-red-100 text-red-800",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
