"use client"

import { ZODIAC_SIGNS } from "@/lib/user-model"
import { cn } from "@/lib/utils"

interface ZodiacSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ZodiacSelector({ value, onChange, className }: ZodiacSelectorProps) {
  // 动物图标映射
  const zodiacIcons: Record<string, string> = {
    rat: "🐀",
    ox: "🐂",
    tiger: "🐅",
    rabbit: "🐇",
    dragon: "🐉",
    snake: "🐍",
    horse: "🐎",
    goat: "🐐",
    monkey: "🐒",
    rooster: "🐓",
    dog: "🐕",
    pig: "🐖"
  }

  return (
    <div className={cn("grid grid-cols-4 gap-3 md:grid-cols-6", className)}>
      {ZODIAC_SIGNS.map((zodiac) => (
        <button
          key={zodiac.id}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-[#5e7a70] hover:bg-gray-50",
            value === zodiac.id && "border-[#5e7a70] bg-[#f2f5f4]"
          )}
          onClick={() => onChange(zodiac.id)}
          type="button"
        >
          <span className="text-3xl" role="img" aria-label={zodiac.name}>
            {zodiacIcons[zodiac.id] || "🐾"}
          </span>
          <span className="text-sm">{zodiac.name}</span>
        </button>
      ))}
    </div>
  )
} 