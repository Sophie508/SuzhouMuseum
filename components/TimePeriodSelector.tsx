"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface TimePeriodSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

// 定义时间段，按照时间线顺序排列
const timePeriods = [
  { id: "马家浜文化", label: "马家浜文化", color: "bg-amber-900" },
  { id: "崧泽文化", label: "崧泽文化", color: "bg-amber-800" },
  { id: "良渚文化", label: "良渚文化", color: "bg-amber-700" },
  { id: "马桥文化", label: "马桥文化", color: "bg-amber-600" },
  { id: "周", label: "周", color: "bg-amber-500" },
  { id: "汉", label: "汉", color: "bg-amber-400" },
  { id: "三国", label: "三国", color: "bg-teal-800" },
  { id: "晋", label: "晋", color: "bg-teal-700" },
  { id: "六朝", label: "六朝", color: "bg-teal-600" },
  { id: "唐", label: "唐", color: "bg-teal-500" },
  { id: "晚唐至五代", label: "晚唐至五代", color: "bg-teal-400" },
  { id: "宋", label: "宋", color: "bg-blue-700" },
  { id: "元", label: "元", color: "bg-blue-500" },
  { id: "明", label: "明", color: "bg-blue-400" },
  { id: "清民国", label: "清民国", color: "bg-purple-500" },
  { id: "近代", label: "近代", color: "bg-purple-400" },
]

export function TimePeriodSelector({ value, onChange, className }: TimePeriodSelectorProps) {
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null)

  // 将时间段分为两行
  const firstHalf = timePeriods.slice(0, Math.ceil(timePeriods.length / 2))
  const secondHalf = timePeriods.slice(Math.ceil(timePeriods.length / 2))

  return (
    <div className={cn("space-y-8", className)}>
      {/* S型时间轴 */}
      <div className="relative w-full h-32 md:h-36">
        {/* S型曲线背景 - 使用简化的div方案代替SVG */}
        <div className="absolute top-8 left-4 right-4 h-3 bg-[#5e7a70] rounded-full"></div>
        <div className="absolute top-24 md:top-28 left-4 right-4 h-3 bg-[#5e7a70] rounded-full"></div>
        <div className="absolute right-4 top-8 w-3 h-20 md:h-[5.5rem] bg-[#5e7a70] rounded-full"></div>
        <div className="absolute left-4 top-8 md:top-9 w-3 h-16 md:h-[4.5rem] bg-[#5e7a70] rounded-full"></div>
        
        {/* 第一行朝代节点 - 从左到右 */}
        {firstHalf.map((period, index) => {
          // 计算位置，从左到右均匀分布
          const position = `${(index / (firstHalf.length - 1)) * (100 - 8)}%`
          const isSelected = value === period.id
          const isHovered = hoveredPeriod === period.id
          
          return (
            <div 
              key={period.id}
              className="absolute transform -translate-x-1/2 z-10"
              style={{ left: `calc(4% + ${position})`, top: '1.25rem' }}
            >
              <button
                type="button"
                className={cn(
                  "w-4 h-4 rounded-full relative",
                  isSelected ? period.color : "bg-gray-400",
                  "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:rounded-full",
                  (isSelected || isHovered) && "before:animate-ping before:bg-gray-300 before:opacity-75"
                )}
                onClick={() => onChange(period.id)}
                onMouseEnter={() => setHoveredPeriod(period.id)}
                onMouseLeave={() => setHoveredPeriod(null)}
              />
              
              <div className={cn(
                "absolute top-6 transform -translate-x-1/2 transition-all duration-200 text-center whitespace-pre-line",
                "w-20",
                (isSelected || isHovered) ? "opacity-100 translate-y-0" : "opacity-70 -translate-y-1"
              )}>
                <div className={cn(
                  "text-sm font-medium",
                  isSelected && "text-[#5e7a70]"
                )}>
                  {period.label}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* 第二行朝代节点 - 从右到左 (反向排列) */}
        {secondHalf.map((period, index) => {
          // 计算位置，从右到左均匀分布
          const position = `${(1 - index / (secondHalf.length - 1)) * (100 - 8)}%`
          const isSelected = value === period.id
          const isHovered = hoveredPeriod === period.id
          
          return (
            <div 
              key={period.id}
              className="absolute transform -translate-x-1/2 z-10"
              style={{ left: `calc(4% + ${position})`, top: '6rem' }}
            >
              <button
                type="button"
                className={cn(
                  "w-4 h-4 rounded-full relative",
                  isSelected ? period.color : "bg-gray-400",
                  "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:rounded-full",
                  (isSelected || isHovered) && "before:animate-ping before:bg-gray-300 before:opacity-75"
                )}
                onClick={() => onChange(period.id)}
                onMouseEnter={() => setHoveredPeriod(period.id)}
                onMouseLeave={() => setHoveredPeriod(null)}
              />
              
              <div className={cn(
                "absolute top-6 transform -translate-x-1/2 transition-all duration-200 text-center whitespace-pre-line",
                "w-20",
                (isSelected || isHovered) ? "opacity-100 translate-y-0" : "opacity-70 -translate-y-1"
              )}>
                <div className={cn(
                  "text-sm font-medium",
                  isSelected && "text-[#5e7a70]"
                )}>
                  {period.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 时期网格选择器 (移动设备更友好) */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {timePeriods.map((period) => (
          <button
            key={period.id}
            className={cn(
              "rounded-lg border p-2 transition-all text-center",
              "hover:border-[#5e7a70] hover:bg-gray-50",
              value === period.id && "border-[#5e7a70] bg-[#f2f5f4]"
            )}
            onClick={() => onChange(period.id)}
            type="button"
          >
            <div className="text-sm font-medium">{period.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
} 