"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Info, BookOpen, Sparkle, Star, Bookmark, AwardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getFavoriteArtifactIds } from "@/lib/recommendation-service"
import { ZODIAC_SIGNS, MBTI_TYPES } from "@/lib/user-model"

export default function DuringVisitPage() {
  const [loading, setLoading] = useState(true)
  const [insightDialogOpen, setInsightDialogOpen] = useState(false)
  const [insightContent, setInsightContent] = useState("")
  const [insightLoading, setInsightLoading] = useState(false)

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 加载任何必要的数据
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 获取AI洞察示例
  const getAIInsight = (prompt: string) => {
    setInsightLoading(true)
    setInsightDialogOpen(true)
    
    // 模拟AI生成内容
    setTimeout(() => {
      let insight = ""
      
      if (prompt === "historical_analysis") {
        insight = "这是一段关于历史背景的AI生成内容。在实际应用中，这里会根据具体的藏品信息，生成相关的历史文化背景解读，帮助参观者更好地理解藏品的历史价值和意义。"
      } else if (prompt === "art_analysis") {
        insight = "这是一段关于艺术分析的AI生成内容。在实际应用中，这里会根据具体的藏品特点，从艺术角度进行分析，包括风格、技法、美学价值等方面，帮助参观者更好地欣赏艺术作品。"
      } else if (prompt === "cultural_significance") {
        insight = "这是一段关于文化意义的AI生成内容。在实际应用中，这里会解析藏品在文化发展中的地位和影响，揭示其所蕴含的文化符号和价值观念，帮助参观者理解中华文化的深厚底蕴。"
      }
      
      setInsightContent(insight)
      setInsightLoading(false)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回首页</span>
        </Link>
        <div className="text-xl font-medium">参观导览</div>
        <div className="w-24"></div>
      </header>

      {/* 个性化推荐栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-5 px-6 md:px-12">
          <h2 className="text-xl font-medium mb-5">个性化推荐</h2>
          
          {/* 收藏提醒卡片 - 增强版 */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 rounded-full p-2.5 mt-0.5">
                <Bookmark className="h-6 w-6 text-amber-600 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-amber-800">收藏您喜爱的藏品</h3>
                <p className="text-amber-700 mt-2">
                  在参观过程中，点击喜爱藏品的"收藏"按钮，将它们添加到您的个人收藏中。
                </p>
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-md border border-amber-200">
                  <p className="text-amber-800 font-medium flex items-center gap-2">
                    <AwardIcon className="h-5 w-5" />
                    参观回顾提示
                  </p>
                  <p className="text-amber-700 mt-1">
                    您收藏的藏品将在"参观回顾"阶段为您提供专属测验题，帮助您巩固知识并获得更深入的了解。收藏的藏品越多，测验内容越丰富！
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 生肖和MBTI推荐卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* 生肖推荐卡片 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-[#f3f9e3] text-[#5e7a70]">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkle className="h-5 w-5" /> 
                  <span>生肖相关藏品</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <p className="text-gray-600">根据您的生肖发现与之相关的藏品，了解中国传统生肖文化在艺术中的体现。</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {ZODIAC_SIGNS.slice(0, 6).map(zodiac => (
                    <span key={zodiac.id} className="inline-block bg-[#f3f9e3] text-[#5e7a70] px-2 py-1 rounded-full text-xs">
                      {zodiac.name}
                    </span>
                  ))}
                  <span className="inline-block bg-[#f3f9e3] text-[#5e7a70] px-2 py-1 rounded-full text-xs">...</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Link href="/during-visit/zodiac" className="w-full">
                  <Button variant="default" className="w-full bg-[#5e7a70] hover:bg-[#4d665c]">
                    探索生肖藏品
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* MBTI推荐卡片 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-[#e5f1f9] text-[#2a6d9e]">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" /> 
                  <span>MBTI个性藏品</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <p className="text-gray-600">基于您的MBTI性格类型推荐藏品，探索与您气质相符的艺术作品。</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {MBTI_TYPES.slice(0, 6).map(mbti => (
                    <span key={mbti.id} className="inline-block bg-[#e5f1f9] text-[#2a6d9e] px-2 py-1 rounded-full text-xs">
                      {mbti.id}
                    </span>
                  ))}
                  <span className="inline-block bg-[#e5f1f9] text-[#2a6d9e] px-2 py-1 rounded-full text-xs">...</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Link href="/during-visit/mbti" className="w-full">
                  <Button variant="default" className="w-full bg-[#2a6d9e] hover:bg-[#1f5a87]">
                    探索个性藏品
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* 馆藏精品卡片 */}
          <Card className="hover:shadow-md transition-shadow mb-6">
            <CardHeader className="bg-[#f9e3e3] text-[#a05252]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" /> 
                <span>馆藏精品</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-2">
              <p className="text-gray-600">浏览苏州博物馆的精品藏品，按照历史朝代分类查看各个时期的艺术杰作。</p>
              <p className="text-gray-600 mt-2">从良渚文化到近现代，探索中国几千年的艺术与文化发展脉络。</p>
              <div className="mt-3 p-3 bg-[#f9e3e3]/30 rounded-md border border-[#f9e3e3]">
                <p className="text-[#a05252] text-sm">
                  <span className="font-medium">提示：</span> 
                  除了个性化探索外，馆藏精品中涵盖了苏州博物馆所有的藏品收藏。您可以在此浏览并将感兴趣的藏品添加到您的收藏中，丰富您的参观体验。
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Link href="/collections" className="w-full">
                <Button variant="default" className="w-full bg-[#a05252] hover:bg-[#8a4545]">
                  浏览馆藏精品
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* 参观路径导航 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">您的参观路径</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#5e7a70] text-white flex items-center justify-center">1</div>
                <div className="text-center mt-2">
                  <p className="font-medium">参观规划</p>
                  <Link href="/pre-visit" className="text-sm text-[#5e7a70]">
                    返回修改规划
                  </Link>
                </div>
              </div>
              
              <div className="h-0.5 flex-grow bg-gray-200 mx-2"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#5e7a70] text-white flex items-center justify-center border-2 border-white ring-2 ring-[#5e7a70]">2</div>
                <div className="text-center mt-2">
                  <p className="font-medium">正在参观</p>
                  <p className="text-sm text-gray-500">当前环节</p>
                </div>
              </div>
              
              <div className="h-0.5 flex-grow bg-gray-200 mx-2"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div>
                <div className="text-center mt-2">
                  <p className="font-medium">参观回顾</p>
                  <Link href="/post-visit" className="text-sm text-[#5e7a70]">
                    前往测验
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-grow p-6 md:p-12">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-medium mb-4">参观博物馆时您可以：</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#5e7a70] text-white flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-medium">按照生肖或MBTI类型探索藏品</h3>
                <p className="text-gray-600 mt-1">选择您感兴趣的分类方式，发现与您个性相符的藏品</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#5e7a70] text-white flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-medium">收藏您喜爱的藏品</h3>
                <p className="text-gray-600 mt-1">点击藏品详情页中的收藏按钮，将喜爱的藏品加入收藏夹</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#5e7a70] text-white flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-medium">扫描藏品二维码获取更多信息</h3>
                <p className="text-gray-600 mt-1">在展馆中使用手机扫描藏品旁的二维码，获取详细解说和趣味知识</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#5e7a70] text-white flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-medium">参观结束后回顾所学知识</h3>
                <p className="text-gray-600 mt-1">在"参观回顾"环节，参与与您收藏藏品相关的知识测验，巩固所学内容</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/during-visit/collections">
              <Button className="bg-[#5e7a70] hover:bg-[#4d665c]">
                <Bookmark className="mr-2 h-5 w-5" />
                浏览我的收藏
              </Button>
            </Link>
            
            <div className="mt-4 text-sm text-gray-500">
              在我的收藏中，您可以查看所有已收藏的藏品，并获取AI智能解读
            </div>
          </div>
        </div>
      </div>

      {/* 藏品洞察对话框 */}
      <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>藏品洞察</DialogTitle>
            <DialogDescription>
              AI生成的藏品分析
            </DialogDescription>
          </DialogHeader>
          
          {insightLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#5e7a70]"></div>
              <p className="ml-3 text-gray-600">正在生成洞察内容...</p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-gray-700 leading-relaxed">{insightContent}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
} 