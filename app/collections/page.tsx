"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadArtifacts, Artifact } from "@/lib/data-service"
import { SafeImage } from "@/components/SafeImage"

// 提取主要朝代
const extractMainDynasty = (period: string): string => {
  // 处理特殊情况：晚唐～五代、唐～五代和五代合并为晚唐至五代
  if (period === "晚唐～五代" || period === "唐～五代" || period === "五代" || period === "唐-五代" || period === "晚唐~五代") {
    return "晚唐至五代"
  }
  
  // 处理特殊情况：良渚文化和良渚合并为良渚文化
  if (period === "良渚" || period === "良渚文化") {
    return "良渚文化"
  }
  
  // 处理特殊情况：唐和唐·大历八年合并为唐
  if (period === "唐" || period === "唐·大历八年(773年)") {
    return "唐"
  }
  
  // 处理特殊情况：东周和周合并为周
  if (period === "东周" || period === "周") {
    return "周"
  }
  
  // 处理特殊情况：宋、北宋和南宋合并为宋
  if (period === "宋" || period === "北宋" || period === "南宋") {
    return "宋"
  }
  
  // 处理特殊情况：东晋归类到晋里面
  if (period === "东晋" || period === "晋") {
    return "晋"
  }
  
  // 从子朝代中提取主朝代（例如"明 嘉靖" => "明"）
  if (period.includes(" ")) {
    return period.split(" ")[0]
  }
  
  return period
}

export default function CollectionsPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [filteredArtifacts, setFilteredArtifacts] = useState<Artifact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [groupedBySubPeriod, setGroupedBySubPeriod] = useState<{[key: string]: Artifact[]}>({})

  // 加载藏品数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await loadArtifacts()
        
        // 修正朝代数据，将相似朝代合并显示
        const normalizedData = data.artifacts.map(artifact => {
          const period = artifact.period
          let displayPeriod = period
          
          // 处理合并的朝代类型
          if (period === "晚唐～五代" || period === "唐～五代" || period === "五代" || period === "晚唐~五代") {
            displayPeriod = "晚唐至五代"
          } else if (period === "良渚" || period === "良渚文化") {
            displayPeriod = "良渚文化"
          } else if (period === "唐" || period === "唐·大历八年(773年)") {
            displayPeriod = "唐"
          } else if (period === "东周" || period === "周") {
            displayPeriod = "周"
          } else if (period === "宋" || period === "北宋" || period === "南宋") {
            displayPeriod = "宋"
          } else if (period === "东晋" || period === "晋") {
            displayPeriod = "晋"
          }
          
          return { ...artifact, displayPeriod, originalPeriod: period }
        })
        
        setArtifacts(normalizedData)
        setFilteredArtifacts(normalizedData)
      } catch (error) {
        console.error("Error loading artifacts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    
    if (!term.trim()) {
      // 如果搜索词为空，根据当前筛选器显示藏品
      filterArtifacts(activeFilter)
      return
    }
    
    // 根据搜索词和当前筛选器过滤藏品
    const filtered = artifacts.filter(artifact => {
      const matchesSearch = artifact.name.toLowerCase().includes(term.toLowerCase()) || 
                           artifact.description.toLowerCase().includes(term.toLowerCase())
      
      if (activeFilter === "all") {
        return matchesSearch
      } else {
        const mainDynasty = extractMainDynasty(artifact.displayPeriod || artifact.period)
        return matchesSearch && mainDynasty === activeFilter
      }
    })
    
    setFilteredArtifacts(filtered)
  }

  // 根据时期筛选藏品
  const filterArtifacts = (period: string) => {
    setActiveFilter(period)
    
    if (period === "all") {
      // 如果有搜索词，还需要根据搜索词筛选
      if (searchTerm.trim()) {
        const filtered = artifacts.filter(artifact => 
          artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          artifact.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredArtifacts(filtered)
      } else {
        setFilteredArtifacts(artifacts)
      }
      return
    }
    
    // 根据主要朝代和搜索词筛选
    const filtered = artifacts.filter(artifact => {
      const mainDynasty = extractMainDynasty(artifact.displayPeriod || artifact.period)
      const matchesPeriod = mainDynasty === period
      
      if (!searchTerm.trim()) {
        return matchesPeriod
      } else {
        return matchesPeriod && (
          artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          artifact.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    })
    
    setFilteredArtifacts(filtered)
    
    // 如果是特定朝代，根据子朝代分组
    if (period !== "all") {
      const groups: {[key: string]: Artifact[]} = {}
      filtered.forEach(artifact => {
        // 保留原始朝代信息用于展示
        const subPeriod = artifact.originalPeriod || artifact.period
        if (!groups[subPeriod]) {
          groups[subPeriod] = []
        }
        groups[subPeriod].push(artifact)
      })
      setGroupedBySubPeriod(groups)
    }
  }

  // 计算不同的主要时期
  const periods = artifacts.length > 0 
    ? ["all", ...new Set(artifacts.map(artifact => extractMainDynasty(artifact.displayPeriod || artifact.period)))]
    : ["all"]

  // 按照时间线顺序排序朝代
  const orderedPeriods = ["all", "马家浜文化", "崧泽文化", "良渚文化", "马桥文化", "周", "汉", "三国", "晋", "六朝", "唐", "晚唐至五代", "宋", "元", "明", "清民国", "近代"].filter(period => periods.includes(period))

  // 清除筛选和搜索
  const clearFilters = () => {
    setSearchTerm("")
    setActiveFilter("all")
    setFilteredArtifacts(artifacts)
  }

  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回首页</span>
        </Link>
        <div className="text-xl font-medium">馆藏精品</div>
        <div className="w-24"></div>
      </header>
      
      {/* 搜索和筛选 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="w-full px-6 md:px-12 py-4">
          {/* 参观路径导航 */}
          <div className="mb-4">
            <div className="flex items-center gap-3 text-sm overflow-x-auto">
              <Link href="/" className="text-[#5e7a70] whitespace-nowrap">
                首页
              </Link>
              <span className="text-gray-400">›</span>
              <Link href="/during-visit" className="text-[#5e7a70] whitespace-nowrap">
                参观导览
              </Link>
              <span className="text-gray-400">›</span>
              <span className="font-medium text-gray-800 whitespace-nowrap">馆藏精品</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="搜索藏品名称或描述..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            {(searchTerm || activeFilter !== "all") && (
              <Button 
                variant="ghost" 
                className="flex items-center gap-1"
                onClick={clearFilters}
              >
                <FilterX className="h-4 w-4" />
                <span>清除筛选</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* 时期筛选器 - 改进版 */}
        <div className="w-full px-6 md:px-12 pb-6 pt-2">
          <div className="text-sm font-medium mb-3 text-gray-500">按朝代筛选：</div>
          <div className="relative">
            {/* 时间线指示器 */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-200 z-0 hidden lg:block"></div>
            
            <div className="flex flex-wrap gap-3 items-center justify-start overflow-x-auto pb-2 relative z-10">
              {orderedPeriods.map(period => (
                <button
                  key={period}
                  onClick={() => filterArtifacts(period)}
                  className={`
                    transition-all duration-200 ease-in-out
                    ${period === activeFilter 
                      ? 'bg-[#5e7a70] text-white shadow-md transform scale-110' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'}
                    ${period === "all" 
                      ? 'px-5 py-2.5 rounded-full font-medium' 
                      : period.length > 4
                        ? 'h-[4.5rem] w-[4.5rem] rounded-full flex items-center justify-center text-xs font-medium p-1'
                        : 'h-14 w-14 rounded-full flex items-center justify-center text-sm font-medium'}
                  `}
                >
                  {period === "all" ? "全部" : (
                    <span className="text-center leading-tight">
                      {period}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {activeFilter !== "all" && (
            <div className="mt-3 py-2 px-4 bg-[#f0f4f1] rounded-lg inline-block">
              <span className="text-[#5e7a70] font-medium">当前选择：{activeFilter}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 藏品展示 */}
      <div className="flex-grow p-6 md:p-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#5e7a70]"></div>
            <p className="mt-4 text-gray-600">加载藏品中...</p>
          </div>
        ) : (
          <>
            {filteredArtifacts.length > 0 ? (
              <>
                {activeFilter !== "all" ? (
                  // 按子朝代分组展示
                  <div className="space-y-10">
                    {Object.entries(groupedBySubPeriod).map(([subPeriod, artifacts]) => (
                      <div key={subPeriod} className="space-y-4">
                        <h2 className="text-xl font-serif font-medium text-[#5e7a70] border-b border-gray-200 pb-2">
                          {subPeriod}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {artifacts.map(artifact => (
                            <Link href={`/collections/${artifact.id}`} key={artifact.id}>
                              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                                <div className="relative h-48 w-full">
                                  <SafeImage
                                    src={artifact.image}
                                    alt={artifact.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <CardContent className="p-4">
                                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{artifact.name}</h3>
                                  <p className="text-sm text-gray-500 mb-2">{artifact.originalPeriod || artifact.period}</p>
                                  <p className="text-sm text-gray-700 line-clamp-2">{artifact.description}</p>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 常规展示 - 全部藏品不分组
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredArtifacts.map(artifact => (
                      <Link href={`/collections/${artifact.id}`} key={artifact.id}>
                        <Card className="hover:shadow-md transition-shadow overflow-hidden">
                          <div className="relative h-48 w-full">
                            <SafeImage
                              src={artifact.image}
                              alt={artifact.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-lg mb-1 line-clamp-1">{artifact.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{artifact.originalPeriod || artifact.period}</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{artifact.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600">未找到匹配的藏品</p>
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  清除筛选条件
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
} 