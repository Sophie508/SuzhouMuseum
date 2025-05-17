"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface VisitDurationSelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const durationOptions = [
  { value: 30, label: "半小时" },
  { value: 60, label: "1小时" },
  { value: 90, label: "1.5小时" },
  { value: 120, label: "2小时" },
  { value: 180, label: "3小时" },
  { value: 240, label: "4小时" },
]

export function VisitDurationSelector({ value, onChange, className }: VisitDurationSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-[#5e7a70]">
        <Clock className="h-5 w-5" />
        <Label className="text-base font-medium">参观时长</Label>
      </div>
      
      <Slider
        defaultValue={[value]}
        min={30}
        max={240}
        step={30}
        onValueChange={(values) => onChange(values[0])}
        className="my-6"
      />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>30分钟</span>
        <span>4小时</span>
      </div>
      
      <div className="text-center text-xl font-medium text-[#5e7a70] mt-4">
        {value >= 60 
          ? `${value / 60}小时${value % 60 > 0 ? `${value % 60}分钟` : ''}`
          : `${value}分钟`
        }
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-6">
        {durationOptions.map((option) => (
          <button
            key={option.value}
            className={cn(
              "rounded-lg border p-2 transition-all text-center",
              "hover:border-[#5e7a70] hover:bg-gray-50",
              value === option.value && "border-[#5e7a70] bg-[#f2f5f4] text-[#5e7a70]"
            )}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
} 