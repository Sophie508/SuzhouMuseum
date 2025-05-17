"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

// 定义兴趣问题类型
type Question = {
  id: string
  text: string
  description?: string
  choices: {
    id: string
    text: string
    imageUrl?: string
    value: string
  }[]
  type: "single" | "multiple" | "scale"
}

// 记录用户回答
type UserAnswer = {
  questionId: string
  choices: string[]
}

export default function PreVisitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [preferences, setPreferences] = useState<Record<string, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  // 样例问题数据
  const questions: Question[] = [
    {
      id: "q1",
      text: "您对以下哪类文物最感兴趣？",
      description: "选择一个或多个您最想了解的文物类型",
      choices: [
        { id: "c1", text: "古代瓷器", imageUrl: "/placeholder.svg?height=150&width=150", value: "ceramics" },
        { id: "c2", text: "书画作品", imageUrl: "/placeholder.svg?height=150&width=150", value: "paintings" },
        { id: "c3", text: "古代家具", imageUrl: "/placeholder.svg?height=150&width=150", value: "furniture" },
        { id: "c4", text: "刺绣工艺", imageUrl: "/placeholder.svg?height=150&width=150", value: "embroidery" },
      ],
      type: "multiple",
    },
    {
      id: "q2",
      text: "您参观博物馆的主要目的是什么？",
      choices: [
        { id: "c1", text: "了解历史文化", value: "history" },
        { id: "c2", text: "欣赏艺术作品", value: "art" },
        { id: "c3", text: "打卡拍照分享", value: "social" },
        { id: "c4", text: "休闲放松", value: "leisure" },
      ],
      type: "single",
    },
    {
      id: "q3",
      text: "您认为对藏品的深入解释对您的参观体验有多重要？",
      choices: [
        { id: "c1", text: "非常重要", value: "5" },
        { id: "c2", text: "比较重要", value: "4" },
        { id: "c3", text: "一般", value: "3" },
        { id: "c4", text: "不太重要", value: "2" },
        { id: "c5", text: "不重要", value: "1" },
      ],
      type: "single",
    },
    {
      id: "q4",
      text: "您对以下哪个历史时期最感兴趣？",
      choices: [
        { id: "c1", text: "先秦至汉代", value: "ancient" },
        { id: "c2", text: "魏晋南北朝", value: "medieval" },
        { id: "c3", text: "唐宋时期", value: "tang-song" },
        { id: "c4", text: "元明清时期", value: "yuan-ming-qing" },
        { id: "c5", text: "近现代", value: "modern" },
      ],
      type: "multiple",
    },
    {
      id: "q5",
      text: "以下哪种博物馆体验方式最符合您的期望？",
      choices: [
        { id: "c1", text: "按时间顺序系统参观", value: "systematic" },
        { id: "c2", text: "只看重点精品展品", value: "highlights" },
        { id: "c3", text: "随意漫步探索", value: "explore" },
        { id: "c4", text: "参加专业讲解", value: "guided" },
      ],
      type: "single",
    },
  ]

  // 当前问题
  const currentQuestion = questions[currentIndex]

  // 处理选择
  const handleChoice = (choiceId: string) => {
    const question = questions[currentIndex]
    
    if (question.type === "single") {
      // 单选题直接替换答案
      setUserAnswers((prev) => {
        const filtered = prev.filter((a) => a.questionId !== question.id)
        return [...filtered, { questionId: question.id, choices: [choiceId] }]
      })
    } else {
      // 多选题，切换选择状态
      setUserAnswers((prev) => {
        const existingAnswer = prev.find((a) => a.questionId === question.id)
        
        if (!existingAnswer) {
          return [...prev, { questionId: question.id, choices: [choiceId] }]
        }
        
        const hasChoice = existingAnswer.choices.includes(choiceId)
        const updatedChoices = hasChoice
          ? existingAnswer.choices.filter((c) => c !== choiceId)
          : [...existingAnswer.choices, choiceId]
        
        return prev.map((a) => 
          a.questionId === question.id 
            ? { ...a, choices: updatedChoices } 
            : a
        )
      })
    }
  }

  // 检查选项是否已选择
  const isSelected = (choiceId: string) => {
    const answer = userAnswers.find((a) => a.questionId === currentQuestion.id)
    return answer ? answer.choices.includes(choiceId) : false
  }

  // 进入下一题
  const goToNext = () => {
    // 检查是否已回答当前问题
    const currentAnswer = userAnswers.find((a) => a.questionId === currentQuestion.id)
    
    if (!currentAnswer || currentAnswer.choices.length === 0) {
      toast({
        title: "请先回答问题",
        description: "请至少选择一个选项后再继续",
        variant: "destructive",
      })
      return
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // 所有问题已完成，分析兴趣偏好
      analyzePreferences()
    }
  }

  // 返回上一题
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // 分析用户兴趣偏好
  const analyzePreferences = () => {
    const prefs: Record<string, number> = {
      ceramics: 0,
      paintings: 0,
      furniture: 0,
      embroidery: 0,
      history: 0,
      art: 0,
      ancient: 0,
      medieval: 0,
      "tang-song": 0,
      "yuan-ming-qing": 0,
      modern: 0,
    }
    
    // 分析每个答案对应的兴趣指标
    userAnswers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId)
      if (!question) return
      
      answer.choices.forEach(choiceId => {
        const choice = question.choices.find(c => c.id === choiceId)
        if (!choice) return
        
        if (choice.value in prefs) {
          prefs[choice.value] += 1
        }
        
        // 特殊处理某些答案与兴趣的关联
        if (question.id === "q2" && choice.value === "art") {
          prefs.paintings += 0.5
          prefs.ceramics += 0.5
        }
        
        if (question.id === "q2" && choice.value === "history") {
          prefs.ancient += 0.5
          prefs["tang-song"] += 0.5
        }
      })
    })
    
    setPreferences(prefs)
    setIsCompleted(true)
    
    // 保存结果到本地存储
    localStorage.setItem("suzhou-user-preferences", JSON.stringify(prefs))
    
    // 展示分析结果
    toast({
      title: "分析完成！",
      description: "已根据您的回答生成个性化推荐",
    })
  }

  // 完成并前往浏览页面
  const completeAndProceed = () => {
    router.push('/ai-guide')
  }

  // 进度百分比
  const progress = Math.round((currentIndex / (questions.length - 1)) * 100)

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f7f5]">
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Image src="/logo.svg" alt="苏州博物馆" width={40} height={40} className="h-8 w-8" />
          </Link>
          <h1 className="text-xl font-serif">参观前兴趣探索</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          {!isCompleted ? (
            <Card className="w-full shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">
                    问题 {currentIndex + 1} / {questions.length}
                  </p>
                </div>

                <h2 className="text-2xl font-serif mb-2">{currentQuestion.text}</h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentQuestion.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all
                        ${isSelected(choice.id) 
                          ? "border-[#5e7a70] bg-[#5e7a70]/10" 
                          : "border-gray-200 hover:border-[#5e7a70]/50"}
                      `}
                      onClick={() => handleChoice(choice.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {choice.imageUrl && (
                            <div className="mb-3">
                              <Image
                                src={choice.imageUrl}
                                alt={choice.text}
                                width={150}
                                height={150}
                                className="rounded-md object-cover"
                              />
                            </div>
                          )}
                          <p className="font-medium">{choice.text}</p>
                        </div>
                        {isSelected(choice.id) && (
                          <div className="h-6 w-6 rounded-full bg-[#5e7a70] flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                  >
                    上一题
                  </Button>
                  <Button 
                    className="bg-[#5e7a70] hover:bg-[#4a6258]"
                    onClick={goToNext}
                  >
                    {currentIndex < questions.length - 1 ? "下一题" : "完成"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-serif mb-4">兴趣分析完成</h2>
                <p className="mb-6">
                  根据您的回答，我们为您生成了个性化的参观建议。以下是您的兴趣偏好分析：
                </p>

                <div className="space-y-4 mb-8">
                  <div>
                    <h3 className="font-medium mb-2">藏品类型偏好</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">瓷器</p>
                        <Progress value={preferences.ceramics * 20} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">书画</p>
                        <Progress value={preferences.paintings * 20} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">家具</p>
                        <Progress value={preferences.furniture * 20} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">刺绣</p>
                        <Progress value={preferences.embroidery * 20} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">历史时期偏好</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">唐宋时期</p>
                        <Progress value={preferences["tang-song"] * 20} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">元明清时期</p>
                        <Progress value={preferences["yuan-ming-qing"] * 20} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#5e7a70] hover:bg-[#4a6258]"
                  onClick={completeAndProceed}
                >
                  查看为您推荐的藏品 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
} 