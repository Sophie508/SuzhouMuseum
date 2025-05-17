"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Heart, Bookmark, MessageCircle, Star, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SafeImage } from "@/components/SafeImage"
import { Artifact, getArtifactById } from "@/lib/data-service"
import { getFavoriteArtifactIds, toggleFavoriteArtifact } from "@/lib/recommendation-service"

export default function CollectedArtifactsPage() {
  const [loading, setLoading] = useState(true)
  const [favoriteArtifacts, setFavoriteArtifacts] = useState<Artifact[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [aiInterpretation, setAiInterpretation] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [interpretationDialogOpen, setInterpretationDialogOpen] = useState(false)
  
  // 加载收藏的藏品
  useEffect(() => {
    const loadFavoriteArtifacts = async () => {
      try {
        setLoading(true)
        const favoriteIds = getFavoriteArtifactIds()
        
        if (favoriteIds.length === 0) {
          setFavoriteArtifacts([])
          return
        }
        
        // 获取每个收藏的藏品的详细信息
        const artifactsPromises = favoriteIds.map(id => getArtifactById(id))
        const artifacts = await Promise.all(artifactsPromises)
        
        // 过滤掉可能的null值
        setFavoriteArtifacts(artifacts.filter(artifact => artifact !== null) as Artifact[])
      } catch (error) {
        console.error("Error loading favorite artifacts:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFavoriteArtifacts()
  }, [])
  
  // 处理藏品收藏状态切换
  const handleFavoriteToggle = (artifactId: string) => {
    const newFavorites = toggleFavoriteArtifact(artifactId)
    
    // 从当前显示的藏品中移除
    setFavoriteArtifacts(prevArtifacts => 
      prevArtifacts.filter(artifact => newFavorites.includes(artifact.id))
    )
    
    // 如果移除的是当前选中的藏品，则关闭详情对话框
    if (selectedArtifact && artifactId === selectedArtifact.id) {
      setDetailDialogOpen(false)
    }
  }
  
  // 查看藏品详情
  const viewArtifactDetail = (artifact: Artifact) => {
    setSelectedArtifact(artifact)
    setDetailDialogOpen(true)
  }
  
  // 获取AI解读
  const getAIInterpretation = (artifact: Artifact) => {
    setAiLoading(true)
    setInterpretationDialogOpen(true)
    
    // 此处模拟AI生成解读内容
    // 在实际应用中，这里应该调用后端API获取AI解读
    setTimeout(() => {
      const interpretations = [
        `${artifact.name}是${artifact.period}时期的重要艺术品，具有很高的历史和艺术价值。这件作品展现了当时精湛的工艺技术和独特的美学风格。从细节处理到整体构图，都体现了创作者的深厚功力和独特视角。`,
        `这件${artifact.name}代表了${artifact.period}时期艺术的巅峰水平。观察作品的线条和色彩运用，可以感受到当时社会审美和文化价值观的变迁。此藏品是研究中国艺术史不可忽视的重要实物资料。`,
        `从艺术史角度看，${artifact.name}是连接前后时期艺术风格的重要桥梁。它既保留了传统元素，又融入了新的表现手法，反映了${artifact.period}时期社会文化的变革与传承。`,
        `${artifact.name}不仅是一件精美的艺术品，更是研究${artifact.period}社会生活、信仰体系和技术水平的重要实物证据。通过对它的研究，我们可以更好地理解当时的历史背景和文化语境。`
      ]
      
      // 随机选择一条解读
      setAiInterpretation(interpretations[Math.floor(Math.random() * interpretations.length)])
      setAiLoading(false)
    }, 1500)
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
    return artifact.localImage || artifact.image || '/placeholder-image.jpg';
  }
  
  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/during-visit" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回参观导览</span>
        </Link>
        <div className="text-xl font-medium">我的收藏</div>
        <div className="w-24"></div>
      </header>
      
      <div className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* 导航提示 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-3 text-sm overflow-x-auto">
              <Link href="/during-visit" className="text-[#5e7a70] whitespace-nowrap">
                参观导览
              </Link>
              <span className="text-gray-400">›</span>
              <span className="font-medium text-gray-800 whitespace-nowrap">我的收藏</span>
              <span className="text-gray-400 ml-auto">›</span>
              <Link href="/post-visit" className="text-[#5e7a70] whitespace-nowrap">
                前往参观回顾
              </Link>
            </div>
          </div>
          
          {/* 收藏提示卡片 */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-2.5 mt-0.5">
                <Bookmark className="h-6 w-6 text-blue-600 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-blue-800">您的藏品收藏</h3>
                <p className="text-blue-700 mt-2">
                  在这里您可以查看所有已收藏的藏品，点击藏品卡片查看详情，或获取AI智能解读，加深对藏品的理解。
                </p>
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-md border border-blue-200">
                  <p className="text-blue-800 font-medium flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    提示
                  </p>
                  <p className="text-blue-700 mt-1">
                    这些收藏的藏品将在"参观回顾"阶段为您提供专属测验题，帮助您巩固知识并获得更深入的了解。
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 藏品展示 */}
          <div>
            <h2 className="text-2xl font-serif mb-4">您收藏的藏品 ({favoriteArtifacts.length})</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#5e7a70]"></div>
                <p className="ml-4 text-gray-600">正在加载您收藏的藏品...</p>
              </div>
            ) : favoriteArtifacts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {favoriteArtifacts.map((artifact) => (
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
                          className="gap-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(artifact.id);
                          }}
                        >
                          <Heart className="h-4 w-4 fill-red-500" />
                          移除收藏
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            getAIInterpretation(artifact);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          AI解读
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-12 flex justify-center gap-4">
                  <Link href="/during-visit">
                    <Button variant="outline" className="border-[#5e7a70] text-[#5e7a70] hover:bg-[#f0f5f3] gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>返回个性化推荐</span>
                    </Button>
                  </Link>
                  <Link href="/post-visit">
                    <Button className="bg-[#5e7a70] hover:bg-[#4d665c] gap-2">
                      <span>前往参观回顾</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <XCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">暂无收藏藏品</h3>
                <p className="text-gray-600 mb-6">
                  您还没有收藏任何藏品，可以通过生肖、MBTI个性或馆藏精品页面浏览并收藏感兴趣的藏品
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/during-visit/zodiac">
                    <Button variant="outline" className="w-full sm:w-auto">探索生肖藏品</Button>
                  </Link>
                  <Link href="/during-visit/mbti">
                    <Button variant="outline" className="w-full sm:w-auto">探索MBTI个性藏品</Button>
                  </Link>
                  <Link href="/collections">
                    <Button variant="outline" className="w-full sm:w-auto">浏览馆藏精品</Button>
                  </Link>
                </div>
                <div className="mt-6">
                  <Link href="/during-visit">
                    <Button variant="outline" className="border-[#5e7a70] text-[#5e7a70] hover:bg-[#f0f5f3] gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>返回个性化推荐</span>
                    </Button>
                  </Link>
                </div>
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
                    fill
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
                  
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleFavoriteToggle(selectedArtifact.id)}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      variant="outline"
                    >
                      <Heart className="mr-2 h-5 w-5 fill-red-500" />
                      移除收藏
                    </Button>
                    
                    <Button
                      onClick={() => getAIInterpretation(selectedArtifact)}
                      className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      variant="outline"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      获取AI解读
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* AI解读对话框 */}
      <Dialog open={interpretationDialogOpen} onOpenChange={setInterpretationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              AI藏品解读
            </DialogTitle>
            <DialogDescription>
              基于人工智能的藏品深度解析
            </DialogDescription>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="ml-3 text-gray-600">AI正在生成藏品解读...</p>
            </div>
          ) : (
            <div className="py-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 leading-relaxed">{aiInterpretation}</p>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">提示：</span>
                  AI解读基于对藏品的历史、艺术和文化价值的分析，仅供参考。如有更权威的专业解读，请以专业资料为准。
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
} 