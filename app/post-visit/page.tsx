"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Artifact, getArtifactsByIds, getQuizzesForArtifact, Quiz } from "@/lib/data-service"
import { getFavoriteArtifactIds } from "@/lib/recommendation-service"
import { SafeImage } from "@/components/SafeImage"

export default function PostVisitPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteArtifacts, setFavoriteArtifacts] = useState<Artifact[]>([])
  const [quizQuestions, setQuizQuestions] = useState<Quiz[]>([])
  const [currentQuizStep, setCurrentQuizStep] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({})
  const [showResult, setShowResult] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [summaryText, setSummaryText] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  
  // 从本地存储加载收藏和对应的藏品数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 获取收藏的藏品IDs
        const favoriteIds = getFavoriteArtifactIds()
        setFavorites(favoriteIds)
        
        // 如果有收藏，加载藏品详细信息
        if (favoriteIds.length > 0) {
          const artifacts = await getArtifactsByIds(favoriteIds)
          setFavoriteArtifacts(artifacts)
          
          // 加载藏品相关的测验题
          setLoadingQuizzes(true)
          const quizzes: Quiz[] = []
          
          // 为每个收藏的藏品获取测验题
          for (const artifact of artifacts) {
            const artifactQuizzes = await getQuizzesForArtifact(artifact.id)
            if (artifactQuizzes.length > 0) {
              // 每个藏品只取一个测验题
              quizzes.push(artifactQuizzes[0])
            }
          }
          
          // 如果测验题太多，只保留前5个
          const finalQuizzes = quizzes.slice(0, 5)
          setQuizQuestions(finalQuizzes)
          setLoadingQuizzes(false)
        }
      } catch (error) {
        console.error('Error loading favorite artifacts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // 获取当前问题
  const getCurrentQuestion = () => {
    if (currentQuizStep < quizQuestions.length) {
      return quizQuestions[currentQuizStep]
    }
    return null
  }
  
  // 处理答案选择
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    })
  }
  
  // 下一个问题
  const nextQuestion = () => {
    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1)
    } else {
      // 完成所有问题，显示结果
      setShowResult(true)
      generateSummary()
    }
  }
  
  // 重新开始测验
  const restartQuiz = () => {
    setCurrentQuizStep(0)
    setSelectedAnswers({})
    setShowResult(false)
  }
  
  // 计算正确答案数量
  const getCorrectAnswersCount = () => {
    let correctCount = 0
    
    quizQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    
    return correctCount
  }
  
  // 生成学习总结
  const generateSummary = () => {
    // 在实际产品中，这里会调用API生成个性化总结
    // 对于MVP，使用预设文本
    const correctCount = getCorrectAnswersCount()
    
    let summary = `您今天参观了苏州博物馆，收藏了${favoriteArtifacts.length}件藏品：`
    
    favoriteArtifacts.forEach(artifact => {
      summary += `\n\n${artifact.name}（${artifact.period}）：${artifact.description.substring(0, 50)}...`
    })
    
    summary += `\n\n在知识测验中，您回答了${correctCount}/${quizQuestions.length}个问题正确。`
    
    if (correctCount === quizQuestions.length) {
      summary += "\n\n太棒了！您对参观的藏品有了深入的了解。欢迎下次再来探索更多苏州文化的魅力！"
    } else if (correctCount >= quizQuestions.length / 2) {
      summary += "\n\n不错的表现！您已经掌握了一些重要知识，期待您下次访问能发现更多有趣的细节。"
    } else {
      summary += "\n\n感谢您的参观！希望这次体验能激发您对苏州文化的兴趣，欢迎再次光临，探索更多精彩内容。"
    }
    
    setSummaryText(summary)
  }
  
  // 获取当前问题的藏品
  const getCurrentQuestionArtifact = () => {
    const question = getCurrentQuestion()
    if (!question) return null
    
    const matchedArtifact = favoriteArtifacts.find(artifact => artifact.id === question.artifactId)
    return matchedArtifact || null
  }
  
  // 检查是否有测验题
  const hasQuizzes = quizQuestions.length > 0
  
  // 进度百分比
  const progressPercentage = hasQuizzes 
    ? ((currentQuizStep + (showResult ? 1 : 0)) / (quizQuestions.length + 1)) * 100
    : 100
  
  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回首页</span>
        </Link>
        <div className="text-xl font-medium">参观回顾</div>
        <div className="w-24"></div>
      </header>
      
      {/* 进度条 */}
      <div className="w-full px-6 md:px-12 py-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex-grow p-6">
        <div className="max-w-3xl mx-auto">
          {/* 收藏回顾 */}
          {!showResult && (
            <Card className="mb-8 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">您的收藏</CardTitle>
                <CardDescription>
                  在参观过程中，您收藏了以下{favoriteArtifacts.length}件藏品
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#5e7a70]"></div>
                    <p className="ml-4 text-gray-600">加载收藏藏品...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {favoriteArtifacts.map(artifact => (
                      <div key={artifact.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="relative h-40 w-full">
                          <SafeImage 
                            src={artifact.image} 
                            alt={artifact.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-lg">{artifact.name}</h3>
                          <p className="text-sm text-gray-500">{artifact.period}</p>
                        </div>
                      </div>
                    ))}
                    
                    {favoriteArtifacts.length === 0 && !loading && (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        您没有收藏任何藏品。下次参观时，点击心形图标可以收藏您喜欢的展品。
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* 测验部分 */}
          {loadingQuizzes ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">知识测验</CardTitle>
                <CardDescription>
                  正在加载测验题...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#5e7a70]"></div>
                  <p className="ml-4 text-gray-600">加载中...</p>
                </div>
              </CardContent>
            </Card>
          ) : !hasQuizzes ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">知识测验</CardTitle>
                <CardDescription>
                  暂无与您收藏藏品相关的测验题
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  您可以返回展览页面收藏更多藏品，或者探索其他展区。
                </div>
              </CardContent>
            </Card>
          ) : !showResult ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">知识测验</CardTitle>
                <CardDescription>
                  测试一下您对参观藏品的了解程度
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getCurrentQuestion() && (
                  <div className="space-y-6">
                    {/* 问题相关的藏品 */}
                    {getCurrentQuestionArtifact() && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image 
                            src={getCurrentQuestionArtifact()?.image || ''} 
                            alt={getCurrentQuestionArtifact()?.name || ''}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{getCurrentQuestionArtifact()?.name}</h3>
                          <p className="text-sm text-gray-500">{getCurrentQuestionArtifact()?.period}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 问题和选项 */}
                    <div>
                      <h3 className="text-xl font-medium mb-4">问题 {currentQuizStep + 1}/{quizQuestions.length}</h3>
                      <p className="mb-6 text-lg">{getCurrentQuestion()?.question}</p>
                      
                      <RadioGroup 
                        value={selectedAnswers[getCurrentQuestion()?.id || '']} 
                        onValueChange={(value) => handleAnswerSelect(getCurrentQuestion()?.id || '', value)}
                      >
                        <div className="space-y-3">
                          {getCurrentQuestion()?.options.map(option => (
                            <div key={option.id} className="flex items-start space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                              <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                              <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={nextQuestion}
                  disabled={!selectedAnswers[getCurrentQuestion()?.id || '']}
                  className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-6"
                >
                  {currentQuizStep < quizQuestions.length - 1 ? '下一题' : '查看结果'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            // 测验结果
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">测验结果</CardTitle>
                <CardDescription>
                  您回答了 {getCorrectAnswersCount()}/{quizQuestions.length} 个问题正确
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        {selectedAnswers[question.id] === question.correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div>
                          <h3 className="font-medium text-lg">{index + 1}. {question.question}</h3>
                          <div className="mt-2 text-sm">
                            <p>
                              <span className="font-medium">您的答案:</span> {
                                question.options.find(opt => opt.id === selectedAnswers[question.id])?.text || '未作答'
                              }
                            </p>
                            <p className="text-green-600 font-medium mt-1">
                              正确答案: {question.options.find(opt => opt.id === question.correctAnswer)?.text}
                            </p>
                          </div>
                          <p className="mt-2 text-gray-600">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={restartQuiz}
                  className="rounded-full px-6"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新测验
                </Button>
                
                <Button 
                  onClick={() => setResultDialogOpen(true)}
                  className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-6"
                >
                  查看参观总结
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      
      {/* 参观总结对话框 */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">您的参观总结</DialogTitle>
            <DialogDescription>
              基于您收藏的藏品和测验结果生成的个性化总结
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{summaryText}</div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setResultDialogOpen(false)}
              className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-6"
            >
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
} 