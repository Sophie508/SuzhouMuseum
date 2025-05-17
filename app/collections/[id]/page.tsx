"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getArtifactById, getQuizzesForArtifact, Artifact, Quiz } from "@/lib/data-service"
import { SafeImage } from "@/components/SafeImage"

export default function ArtifactDetailPage({ params }: { params: { id: string } }) {
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  const [userAnswers, setUserAnswers] = useState<{[quizId: string]: string}>({})
  const [showResults, setShowResults] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const artifactData = await getArtifactById(params.id)
        setArtifact(artifactData)
        
        if (artifactData) {
          const quizzesData = await getQuizzesForArtifact(artifactData.id)
          setQuizzes(quizzesData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.id])
  
  const handleAnswerSelect = (quizId: string, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [quizId]: answerId
    }))
  }
  
  const checkAnswers = () => {
    setShowResults(true)
  }
  
  const resetQuiz = () => {
    setUserAnswers({})
    setShowResults(false)
  }
  
  const getCorrectAnswersCount = () => {
    let count = 0
    quizzes.forEach(quiz => {
      if (userAnswers[quiz.id] === quiz.correctAnswer) {
        count++
      }
    })
    return count
  }
  
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
        <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
          <Link href="/collections" className="flex items-center gap-2 text-[#5e7a70]">
            <ArrowLeft className="h-5 w-5" />
            <span>返回藏品列表</span>
          </Link>
          <div className="text-xl font-medium">藏品详情</div>
          <div className="w-24"></div>
        </header>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#5e7a70]"></div>
          <p className="ml-4 text-gray-600">加载藏品信息...</p>
        </div>
      </main>
    )
  }
  
  if (!artifact) {
    return (
      <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
        <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
          <Link href="/collections" className="flex items-center gap-2 text-[#5e7a70]">
            <ArrowLeft className="h-5 w-5" />
            <span>返回藏品列表</span>
          </Link>
          <div className="text-xl font-medium">藏品详情</div>
          <div className="w-24"></div>
        </header>
        
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <p className="text-gray-600 mb-4">未找到该藏品信息</p>
          <Button asChild>
            <Link href="/collections">返回藏品列表</Link>
          </Button>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/collections" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回藏品列表</span>
        </Link>
        <div className="text-xl font-medium">藏品详情</div>
        <div className="w-24"></div>
      </header>
      
      <div className="flex-grow p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 藏品图片 */}
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
              <SafeImage
                src={artifact.image}
                alt={artifact.name}
                fill
                className="object-contain bg-white"
              />
            </div>
            
            {/* 藏品信息 */}
            <div>
              <h1 className="text-3xl font-serif mb-2">{artifact.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{artifact.originalPeriod || artifact.period}</p>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="info">基本信息</TabsTrigger>
                  <TabsTrigger value="quiz">知识问答</TabsTrigger>
                </TabsList>
                
                {/* 基本信息标签 */}
                <TabsContent value="info" className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">描述</h3>
                    <p className="text-gray-700">{artifact.description}</p>
                  </div>
                  
                  {artifact.dimensions && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">尺寸</h3>
                      <p className="text-gray-700">{artifact.dimensions}</p>
                    </div>
                  )}
                  
                  {artifact.culturalContext && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">文化背景</h3>
                      <p className="text-gray-700">{artifact.culturalContext}</p>
                    </div>
                  )}
                  
                  {artifact.interestingFacts && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">趣闻轶事</h3>
                      <p className="text-gray-700">{artifact.interestingFacts}</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* 知识问答标签 */}
                <TabsContent value="quiz" className="mt-6">
                  {quizzes.length > 0 ? (
                    <div className="space-y-8">
                      {quizzes.map(quiz => (
                        <Card key={quiz.id} className="shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg">{quiz.question}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              value={userAnswers[quiz.id] || ""}
                              onValueChange={(value) => handleAnswerSelect(quiz.id, value)}
                              disabled={showResults}
                            >
                              {quiz.options.map(option => (
                                <div key={option.id} className="flex items-start space-x-2 mb-3">
                                  <RadioGroupItem 
                                    value={option.id} 
                                    id={`${quiz.id}-${option.id}`} 
                                    className="mt-1"
                                  />
                                  <Label 
                                    htmlFor={`${quiz.id}-${option.id}`}
                                    className={`flex-grow font-normal ${
                                      showResults && quiz.correctAnswer === option.id
                                        ? 'text-green-600 font-medium'
                                        : showResults && userAnswers[quiz.id] === option.id && userAnswers[quiz.id] !== quiz.correctAnswer
                                        ? 'text-red-600 line-through'
                                        : ''
                                    }`}
                                  >
                                    {option.text}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            
                            {showResults && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className={`font-medium ${userAnswers[quiz.id] === quiz.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                                  {userAnswers[quiz.id] === quiz.correctAnswer ? '✓ 回答正确!' : '✗ 回答错误'}
                                </p>
                                <p className="mt-2 text-gray-700">{quiz.explanation}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="flex justify-center mt-6">
                        {!showResults ? (
                          <Button 
                            onClick={checkAnswers}
                            disabled={Object.keys(userAnswers).length < quizzes.length}
                            className="min-w-32"
                          >
                            检查答案
                          </Button>
                        ) : (
                          <div className="text-center">
                            <p className="mb-4 font-medium text-lg">
                              您答对了 {getCorrectAnswersCount()}/{quizzes.length} 题
                            </p>
                            <Button onClick={resetQuiz}>重新作答</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">暂无与此藏品相关的问答题</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 