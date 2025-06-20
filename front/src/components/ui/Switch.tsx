"use client"
import { useState } from "react"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({ checked: controlledChecked, onCheckedChange, disabled = false, className = "" }: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(false)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleToggle = () => {
    if (disabled) return

    const newChecked = !checked

    if (isControlled) {
      onCheckedChange?.(newChecked)
    } else {
      setInternalChecked(newChecked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      disabled={disabled}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}
