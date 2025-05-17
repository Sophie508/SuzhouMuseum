"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Info, XCircle, Heart, Bookmark, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SafeImage } from "@/components/SafeImage"
import { Artifact, getArtifactsByZodiac } from "@/lib/data-service"
import { ZODIAC_SIGNS } from "@/lib/user-model"

// 搜索参数消费组件，用于包裹在Suspense中
function SearchParamsConsumer({ children }: { children: (params: ReturnType<typeof useSearchParams>) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export default function ZodiacRecommendationPage() {
  const router = useRouter()
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedZodiac, setSelectedZodiac] = useState<string>("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  
  // 生肖图标映射
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
  
  // 初始化收藏数据（不依赖于searchParams）
  useEffect(() => {
    // 在客户端加载收藏的藏品
    try {
      if (typeof window !== 'undefined') {
        const savedFavorites = localStorage.getItem('favoriteArtifacts');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);
  
  // 获取当前生肖标签
  const getCurrentZodiacName = () => {
    const zodiac = ZODIAC_SIGNS.find(z => z.id === selectedZodiac)
    return zodiac ? zodiac.name : ""
  }
  
  // 获取当前生肖的图标
  const getCurrentZodiacIcon = () => {
    return zodiacIcons[selectedZodiac] || ""
  }
  
  // 加载生肖相关藏品
  useEffect(() => {
    const loadZodiacArtifacts = async () => {
      if (!selectedZodiac) return
      
      try {
        setLoading(true)
        const zodiacArtifacts = await getArtifactsByZodiac(selectedZodiac)
        setArtifacts(zodiacArtifacts)
      } catch (error) {
        console.error("Error loading zodiac artifacts:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (selectedZodiac) {
      loadZodiacArtifacts()
    }
  }, [selectedZodiac])
  
  // 处理生肖选择变化
  const handleZodiacChange = (value: string, searchParams?: ReturnType<typeof useSearchParams>) => {
    setSelectedZodiac(value)
    
    // 更新URL参数但不导航
    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sign", value)
      router.push(`/during-visit/zodiac?${params.toString()}`, { scroll: false })
    }
  }
  
  // 处理藏品收藏
  const handleFavoriteToggle = (artifactId: string) => {
    const newFavorites = favorites.includes(artifactId)
      ? favorites.filter(id => id !== artifactId)
      : [...favorites, artifactId];
    
    setFavorites(newFavorites);
    
    // 保存到localStorage
    try {
      localStorage.setItem('favoriteArtifacts', JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }
  
  // 查看藏品详情
  const viewArtifactDetail = (artifact: Artifact) => {
    setSelectedArtifact(artifact)
    setDetailDialogOpen(true)
  }
  
  // 修复图片路径问题
  const getImagePath = (artifact: Artifact) => {
    // 首先尝试使用image字段
    if (artifact.image && artifact.image.startsWith('http')) {
      return artifact.image;
    }
    
    // 如果localImage路径包含museum_images但不存在，则移除这部分
    if (artifact.localImage && artifact.localImage.includes('museum_images/')) {
      return artifact.localImage.replace('museum_images/', '');
    }
    
    // 回退到任何可用的图片路径
    return artifact.localImage || artifact.image || '/placeholder.jpg';
  }
  
  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/during-visit" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回</span>
        </Link>
        <div className="text-xl font-medium">生肖藏品推荐</div>
        <div className="w-24"></div>
      </header>
      
      <div className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* 参观路径导航 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-3 text-sm overflow-x-auto">
              <Link href="/during-visit" className="text-[#5e7a70] whitespace-nowrap">
                参观导览
              </Link>
              <span className="text-gray-400">›</span>
              <span className="font-medium text-gray-800 whitespace-nowrap">生肖藏品推荐</span>
              <span className="text-gray-400 ml-auto">›</span>
              <Link href="/collections" className="text-[#5e7a70] whitespace-nowrap">
                浏览全部馆藏
              </Link>
            </div>
          </div>
          
          {/* 收藏提醒卡片 */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bookmark className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">收藏您喜爱的藏品</h3>
                <p className="text-amber-700 text-sm mt-1">收藏的藏品将在"参观回顾"阶段为您提供专属测验题，帮助您巩固知识并获得更深入的了解。</p>
              </div>
            </div>
          </div>
          
          {/* 生肖选择器 - 使用Suspense包裹SearchParamsConsumer */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium mb-4">选择您的生肖查看相关藏品</h2>
            
            <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
              <SearchParamsConsumer>
                {(searchParams) => {
                  // 从URL参数获取生肖类型
                  const zodiacFromUrl = searchParams?.get("sign") || "";
                  // 如果URL中有生肖类型且与当前选择不同，则更新当前选择
                  if (zodiacFromUrl && zodiacFromUrl !== selectedZodiac) {
                    // 使用setTimeout来避免在渲染期间setState
                    setTimeout(() => setSelectedZodiac(zodiacFromUrl), 0);
                  }
                  
                  return (
                    <div className="flex items-center gap-4">
                      <Select value={selectedZodiac} onValueChange={(value) => handleZodiacChange(value, searchParams)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="请选择生肖" />
                        </SelectTrigger>
                        <SelectContent>
                          {ZODIAC_SIGNS.map((zodiac) => (
                            <SelectItem key={zodiac.id} value={zodiac.id}>
                              <span className="flex items-center gap-2">
                                {zodiacIcons[zodiac.id]} {zodiac.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedZodiac && (
                        <div className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">{getCurrentZodiacIcon()}</span>
                          <span>与{getCurrentZodiacName()}生肖相关的藏品</span>
                        </div>
                      )}
                    </div>
                  );
                }}
              </SearchParamsConsumer>
            </Suspense>
          </div>
          
          {/* 藏品展示 */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#5e7a70]"></div>
                <p className="ml-4 text-gray-600">正在加载生肖藏品...</p>
              </div>
            ) : selectedZodiac && artifacts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artifacts.map((artifact) => (
                    <Card key={artifact.id} className="overflow-hidden transition-shadow hover:shadow-md">
                      <div className="relative h-64 w-full cursor-pointer" onClick={() => viewArtifactDetail(artifact)}>
                        <SafeImage
                          src={getImagePath(artifact)}
                          alt={artifact.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{artifact.name}</h3>
                        <p className="text-sm text-gray-500">{artifact.period}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleFavoriteToggle(artifact.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${favorites.includes(artifact.id) ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                          {favorites.includes(artifact.id) ? '已收藏' : '收藏'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500"
                          onClick={() => viewArtifactDetail(artifact)}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          详情
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {/* 导航到MBTI页面 */}
                <div className="mt-12 flex justify-center">
                  <Link href="/during-visit/mbti">
                    <Button className="bg-[#2a6d9e] hover:bg-[#1f5a87] gap-2">
                      <span>探索MBTI个性藏品</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : selectedZodiac ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无相关藏品</h3>
                <p className="text-gray-600">我们没有找到与{getCurrentZodiacName()}相关的藏品，请尝试选择其他生肖</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-medium mb-2">请选择一个生肖</h3>
                <p className="text-gray-600">从上面的生肖列表中选择一个，查看相关藏品推荐</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 藏品详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArtifact && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedArtifact.name}</DialogTitle>
                <DialogDescription>{selectedArtifact.fullName || selectedArtifact.period}</DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col md:flex-row gap-6 mt-4">
                <div className="relative h-80 md:w-1/2 rounded-lg overflow-hidden">
                  <SafeImage
                    src={getImagePath(selectedArtifact)}
                    alt={selectedArtifact.name}
                    fill={true}
                    className="object-contain"
                  />
                </div>
                
                <div className="md:w-1/2">
                  <h4 className="font-medium text-lg mb-2">藏品信息</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">朝代:</span> {selectedArtifact.period}</p>
                    <p><span className="font-medium">尺寸:</span> {selectedArtifact.dimensions || "无记录"}</p>
                    <p><span className="font-medium">馆藏位置:</span> {selectedArtifact.location || "苏州博物馆"}</p>
                  </div>
                  
                  <h4 className="font-medium text-lg mt-6 mb-2">藏品描述</h4>
                  <p className="text-gray-700">{selectedArtifact.description || "无详细描述"}</p>
                  
                  {selectedArtifact.interestingFacts && (
                    <>
                      <h4 className="font-medium text-lg mt-6 mb-2">趣闻轶事</h4>
                      <p className="text-gray-700">{selectedArtifact.interestingFacts}</p>
                    </>
                  )}
                  
                  <div className="mt-8">
                    <Button
                      onClick={() => handleFavoriteToggle(selectedArtifact.id)}
                      className={favorites.includes(selectedArtifact.id) ? "bg-[#5e7a70] hover:bg-[#4d665c]" : ""}
                    >
                      {favorites.includes(selectedArtifact.id) ? (
                        <>
                          <Bookmark className="mr-2 h-5 w-5" />
                          已收藏
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-5 w-5" />
                          收藏藏品
                        </>
                      )}
                    </Button>
                    
                    {!favorites.includes(selectedArtifact.id) && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <Bookmark className="h-4 w-4 mr-2 text-gray-400" />
                        收藏藏品将在参观回顾阶段解锁相关测验题
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
} 