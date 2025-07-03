"use client";

import React from "react";

import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuChildProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div ref={dropdownRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
          } as DropdownMenuChildProps);
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
  isOpen,
  setIsOpen,
}: {
  children: ReactNode;
  asChild?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}) {
  const handleClick = () => setIsOpen?.(!isOpen);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick } as {
      onClick: () => void;
    });
  }

  return (
    <button onClick={handleClick} className="outline-none">
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = "start",
  side = "bottom",
  isOpen,
  className = "",
}: {
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  isOpen?: boolean;
  className?: string;
}) {
  if (!isOpen) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  };

  const sideClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div
      className={`absolute z-50 min-w-32 overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md ${alignClasses[align]} ${sideClasses[side]} ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-2 py-1.5 text-sm font-semibold text-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} />;
}
