"use client"

import { MBTI_TYPES } from "@/lib/user-model"
import { cn } from "@/lib/utils"

interface MbtiSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MbtiSelector({ value, onChange, className }: MbtiSelectorProps) {
  // MBTI颜色映射 - 增强颜色对比度和视觉效果
  const mbtiColors: Record<string, string> = {
    // 分析家 - 蓝色系
    INTJ: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 hover:border-blue-400",
    INTP: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 hover:border-blue-400",
    ENTJ: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 hover:border-indigo-400",
    ENTP: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 hover:border-indigo-400",
    
    // 外交家 - 绿色系
    INFJ: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400",
    INFP: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400",
    ENFJ: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400",
    ENFP: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400",
    
    // 哨兵 - 紫色系
    ISTJ: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 hover:border-purple-400",
    ISFJ: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 hover:border-purple-400",
    ESTJ: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 hover:bg-fuchsia-200 hover:border-fuchsia-400",
    ESFJ: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 hover:bg-fuchsia-200 hover:border-fuchsia-400",
    
    // 探险家 - 橙色系
    ISTP: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400",
    ISFP: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400",
    ESTP: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 hover:border-orange-400",
    ESFP: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 hover:border-orange-400",
  }

  // 将MBTI类型分组
  const mbtiGroups = [
    { 
      title: "分析家", 
      description: "理性、逻辑思维者", 
      color: "text-blue-700",
      types: MBTI_TYPES.filter(m => ["INTJ", "INTP", "ENTJ", "ENTP"].includes(m.id)) 
    },
    { 
      title: "外交家", 
      description: "富有同情心的思想家", 
      color: "text-emerald-700",
      types: MBTI_TYPES.filter(m => ["INFJ", "INFP", "ENFJ", "ENFP"].includes(m.id)) 
    },
    { 
      title: "哨兵", 
      description: "实际、细致的组织者", 
      color: "text-purple-700",
      types: MBTI_TYPES.filter(m => ["ISTJ", "ISFJ", "ESTJ", "ESFJ"].includes(m.id)) 
    },
    { 
      title: "探险家", 
      description: "实用、灵活的冒险者", 
      color: "text-amber-700",
      types: MBTI_TYPES.filter(m => ["ISTP", "ISFP", "ESTP", "ESFP"].includes(m.id)) 
    },
  ]

  return (
    <div className={cn("space-y-8", className)}>
      {mbtiGroups.map(group => (
        <div key={group.title} className="space-y-3">
          <div className="mb-4">
            <h4 className={cn("font-semibold text-lg", group.color)}>{group.title}</h4>
            <p className="text-sm text-gray-600">{group.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {group.types.map((mbti) => (
              <button
                key={mbti.id}
                className={cn(
                  "rounded-lg border-2 p-4 transition-all shadow-sm",
                  mbtiColors[mbti.id],
                  value === mbti.id ? "ring-2 ring-[#5e7a70] shadow-md transform scale-105" : ""
                )}
                onClick={() => onChange(mbti.id)}
                type="button"
              >
                <div className="font-bold text-lg">{mbti.id}</div>
                <div className="text-sm mt-1">{mbti.name.split('-')[1]}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 