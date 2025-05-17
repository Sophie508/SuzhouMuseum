"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Send, Bot, ArrowLeft, MapPin, Clock, ThumbsUp, ThumbsDown, Globe, Plus, User, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// 定义交互式消息类型
type InteractiveOption = {
  text: string
  value: string
  icon?: React.ReactNode
}

type InteractiveMessage = {
  id: string
  content: string
  options?: InteractiveOption[]
  type: "route" | "exhibit" | "feedback" | "general"
  imageUrl?: string
}

// 定义对话类型
type Conversation = {
  id: string
  title: string
  messages: {
    role: "user" | "assistant"
    content: string
    id: string
  }[]
  createdAt: Date
}

// 定义语言类型和文本
type Language = "en" | "zh"

const translations = {
  en: {
    aiGuide: "AI Guide to Suzhou Museum",
    chat: "Chat",
    exhibits: "Exhibits",
    routes: "Routes",
    yourGuide: "Your Suzhou AI Guide",
    askAnything: "Ask me anything about Suzhou's history, gardens, culture, or plan your visit to the museum.",
    suggestions: [
      "Tell me about Suzhou's classical gardens",
      "What are the must-see exhibits?",
      "History of Suzhou's silk industry",
      "Recommend a tour route for the museum",
    ],
    helpful: "Helpful",
    needMore: "Need more info",
    placeholder: "Ask about Suzhou's history, culture, or plan your visit...",
    featuredExhibits: "Featured Exhibits",
    recommendedRoutes: "Recommended Routes",
    location: "Location",
    duration: "Duration",
    stops: "Stops",
    selectRoute: "Select this route",
    satisfiedRoute: "I'm satisfied with this route",
    adjustRoute: "I need adjustments",
    viewDetails: "View details",
    viewLocation: "View location",
    language: "Language",
    newChat: "New Chat",
    conversations: "Conversations",
    deleteConversation: "Delete conversation",
    noConversations: "No conversations yet",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
  },
  zh: {
    aiGuide: "苏州博物馆AI导游",
    chat: "AI 对话",
    exhibits: "展品浏览",
    routes: "路线规划",
    yourGuide: "您的苏州AI导游",
    askAnything: "我可以帮您规划参观路线、介绍展品，或回答关于苏州的任何问题。",
    suggestions: ["推荐一条参观路线", "介绍苏州最著名的展品", "苏州园林有什么特色？", "博物馆开放时间是什么时候？"],
    helpful: "有帮助",
    needMore: "需要更多信息",
    placeholder: "询问关于苏州的历史、文化，或规划您的参观路线...",
    featuredExhibits: "精选展品",
    recommendedRoutes: "推荐路线",
    location: "位置",
    duration: "时长",
    stops: "景点",
    selectRoute: "选择此路线",
    satisfiedRoute: "满意，就这个路线",
    adjustRoute: "不满意，需要调整",
    viewDetails: "查看更多详情",
    viewLocation: "查看位置",
    language: "语言",
    newChat: "新对话",
    conversations: "历史对话",
    deleteConversation: "删除对话",
    noConversations: "暂无历史对话",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
  },
}

export default function AIGuidePage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [showingExhibit, setShowingExhibit] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>("en")
  const [processingOption, setProcessingOption] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // 获取当前语言的文本
  const t = translations[language]

  // 初始化或获取当前对话
  const currentConversation = activeConversationId
    ? conversations.find((conv) => conv.id === activeConversationId) || null
    : null

  // 使用 AI SDK 的 useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    append,
    setMessages,
    reload,
    stop,
    error,
  } = useChat({
    api: "/api/chat",
    id: activeConversationId || undefined,
    initialMessages: currentConversation?.messages || [],
    onResponse: (response) => {
      // 如果是新对话，创建一个新的对话记录
      if (!activeConversationId) {
        const newId = Date.now().toString()
        const newConversation: Conversation = {
          id: newId,
          title: input.length > 30 ? `${input.substring(0, 30)}...` : input,
          messages: [{ role: "user", content: input, id: Date.now().toString() }],
          createdAt: new Date(),
        }
        setConversations((prev) => [newConversation, ...prev])
        setActiveConversationId(newId)
      }
    },
    onFinish: (message) => {
      // 更新对话标题和消息
      if (activeConversationId) {
        setConversations((prevConversations) =>
          prevConversations.map((conv) => {
            if (conv.id === activeConversationId) {
              // 使用当前的messages状态，包含用户和AI的所有消息
              return {
                ...conv,
                messages: messages.concat({ role: "assistant", content: message.content, id: Date.now().toString() }),
              }
            }
            return conv
          }),
        )
      }
    },
  })

  // 自定义提交处理函数
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || processingOption || input.trim() === "") return

    // 直接使用append方法发送消息，不再手动更新conversations状态
    append({
      role: "user",
      content: input,
    })
  }

  // 创建新对话
  const startNewChat = () => {
    setActiveConversationId(null)
    setMessages([])
  }

  // 切换对话
  const switchConversation = (id: string) => {
    setActiveConversationId(id)
    const conversation = conversations.find((conv) => conv.id === id)
    if (conversation) {
      setMessages(conversation.messages)
    }
  }

  // 删除对话
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(null)
      setMessages([])
    }
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return t.today
    } else if (diffDays === 1) {
      return t.yesterday
    } else {
      return `${diffDays} ${t.daysAgo}`
    }
  }

  // 模拟展品数据
  const exhibits = [
    {
      id: "exhibit1",
      name: language === "en" ? "Suzhou Embroidery" : "苏州刺绣",
      description:
        language === "en"
          ? "Suzhou embroidery is one of China's four famous embroidery styles, known for its fine needlework, diverse techniques, elegant colors, and lifelike images."
          : "苏州刺绣是中国四大名绣之一，以精细著称，针法繁多，色彩典雅，形象逼真。",
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: language === "en" ? "East Hall, 1st Floor" : "一楼东厅",
    },
    {
      id: "exhibit2",
      name: language === "en" ? "Song Dynasty Celadon" : "宋代青瓷",
      description:
        language === "en"
          ? "Song Dynasty celadon is famous for its unique 'blue-green like the sky after rain' color, representing the pinnacle of Chinese ceramic art."
          : "宋代青瓷以其独特的'雨过天青云破处'的色泽闻名，代表了中国陶瓷艺术的巅峰。",
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: language === "en" ? "North Hall, 2nd Floor" : "二楼北厅",
    },
    {
      id: "exhibit3",
      name: language === "en" ? "Ming & Qing Furniture" : "明清家具",
      description:
        language === "en"
          ? "Suzhou's Ming and Qing dynasty furniture, made from precious woods like rosewood and zitan, features exquisite design and craftsmanship, embodying the artistic value of traditional Chinese furniture."
          : "苏州明清家具以红木、紫檀等名贵木材制作，设计精巧，工艺精湛，体现了中国传统家具的艺术价值。",
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: language === "en" ? "West Hall, 3rd Floor" : "三楼西厅",
    },
  ]

  // 模拟路线数据
  const routes = [
    {
      id: "route1",
      name: language === "en" ? "Classical Gardens Tour" : "经典园林之旅",
      duration: language === "en" ? "2 hours" : "2小时",
      description:
        language === "en"
          ? "Explore Suzhou's most famous classical gardens, including the Humble Administrator's Garden, Lingering Garden, and Master of Nets Garden, experiencing the essence of traditional Chinese garden art."
          : "探索苏州最著名的古典园林，包括拙政园、留园和网师园，体验中国传统园林艺术的精髓。",
      stops:
        language === "en"
          ? ["Humble Administrator's Garden", "Lingering Garden", "Master of Nets Garden"]
          : ["拙政园", "留园", "网师园"],
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "route2",
      name: language === "en" ? "Historical & Cultural Tour" : "历史文化之旅",
      duration: language === "en" ? "3 hours" : "3小时",
      description:
        language === "en"
          ? "Delve into Suzhou's long history and rich culture by visiting Pingjiang Road Historic District, Suzhou Museum, and Cold Mountain Temple."
          : "深入了解苏州的悠久历史和丰富文化，参观平江路历史街区、苏州博物馆和寒山寺。",
      stops:
        language === "en"
          ? ["Pingjiang Road", "Suzhou Museum", "Cold Mountain Temple"]
          : ["平江路", "苏州博物馆", "寒山寺"],
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
  ]

  // 处理选项点击
  const handleOptionSelect = async (option: InteractiveOption) => {
    if (processingOption) return
    setProcessingOption(true)

    try {
      await append({
        role: "user",
        content: option.text,
      })
    } finally {
      setProcessingOption(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // 从本地存储加载对话
  useEffect(() => {
    const savedConversations = localStorage.getItem("suzhou-conversations")
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations)
        // 转换日期字符串为Date对象
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
        }))
        setConversations(conversationsWithDates)
      } catch (e) {
        console.error("Failed to parse saved conversations:", e)
      }
    }
  }, [])

  // 保存对话到本地存储
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("suzhou-conversations", JSON.stringify(conversations))
    }
  }, [conversations])

  if (!mounted) return null

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
          <h1 className="text-xl font-serif">{t.aiGuide}</h1>
        </div>

        {/* 语言切换按钮 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Globe className="h-5 w-5" />
              <span className="sr-only">{t.language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("en")}>English {language === "en" && "✓"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("zh")}>中文 {language === "zh" && "✓"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 flex">
        {/* 侧边栏 */}
        <div
          className={`bg-white border-r w-64 flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="p-4">
            <Button
              onClick={startNewChat}
              className="w-full bg-[#5e7a70] hover:bg-[#4a6258] text-white flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t.newChat}
            </Button>
          </div>

          <div className="px-4 py-2 text-sm font-medium text-gray-500">{t.conversations}</div>

          <ScrollArea className="h-[calc(100vh-140px)]">
            {conversations.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-400 italic">{t.noConversations}</div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      activeConversationId === conversation.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => switchConversation(conversation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="truncate text-sm font-medium">{conversation.title}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={(e) => deleteConversation(conversation.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t.deleteConversation}</span>
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(conversation.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full p-4 md:p-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">{t.chat}</TabsTrigger>
              <TabsTrigger value="exhibits">{t.exhibits}</TabsTrigger>
              <TabsTrigger value="routes">{t.routes}</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <Card className="border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
                <ScrollArea className="flex-1 p-4 md:p-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 mb-4 rounded-full bg-[#5e7a70] flex items-center justify-center">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-serif mb-2">{t.yourGuide}</h2>
                      <p className="text-gray-600 max-w-md">{t.askAnything}</p>
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                        {t.suggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            className="justify-start text-left h-auto py-2 px-3"
                            onClick={() => {
                              if (processingOption) return
                              setProcessingOption(true)
                              append({
                                role: "user",
                                content: suggestion,
                              }).finally(() => setProcessingOption(false))
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-3 max-w-[90%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className={message.role === "user" ? "bg-[#5e7a70]" : "bg-gray-200"}>
                              <AvatarFallback>
                                {message.role === "user" ? (
                                  <User className="h-5 w-5 text-white" />
                                ) : (
                                  <Bot className="h-5 w-5 text-gray-700" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-3">
                              <div
                                className={`rounded-lg p-4 ${
                                  message.role === "user"
                                    ? "bg-[#5e7a70] text-white"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>

                              {message.role === "assistant" && index === messages.length - 1 && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                    onClick={() =>
                                      handleOptionSelect({
                                        text: t.helpful,
                                        value: "like",
                                        icon: <ThumbsUp className="h-4 w-4 mr-2" />,
                                      })
                                    }
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    {t.helpful}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                    onClick={() =>
                                      handleOptionSelect({
                                        text: t.needMore,
                                        value: "dislike",
                                        icon: <ThumbsDown className="h-4 w-4 mr-2" />,
                                      })
                                    }
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    {t.needMore}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t bg-white">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder={t.placeholder}
                      className="min-h-12 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-[#5e7a70] hover:bg-[#4a6258]"
                      disabled={isLoading || processingOption || input.trim() === ""}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="exhibits" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif mb-6">{t.featuredExhibits}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibits.map((exhibit) => (
                      <Card
                        key={exhibit.id}
                        className={`overflow-hidden cursor-pointer transition-all ${
                          showingExhibit === exhibit.id ? "ring-2 ring-[#5e7a70]" : ""
                        }`}
                        onClick={() => setShowingExhibit(exhibit.id === showingExhibit ? null : exhibit.id)}
                      >
                        <div className="relative h-48">
                          <Image
                            src={exhibit.imageUrl || "/placeholder.svg"}
                            alt={exhibit.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-1">{exhibit.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{exhibit.location}</span>
                          </div>
                          {showingExhibit === exhibit.id && <p className="text-sm mt-2">{exhibit.description}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif mb-6">{t.recommendedRoutes}</h2>

                  <div className="space-y-6">
                    {routes.map((route) => (
                      <Card key={route.id} className="overflow-hidden">
                        <div className="md:flex">
                          <div className="relative h-48 md:h-auto md:w-1/3">
                            <Image
                              src={route.imageUrl || "/placeholder.svg"}
                              alt={route.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-4 md:p-6 md:w-2/3">
                            <h3 className="font-medium text-xl mb-2">{route.name}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{route.duration}</span>
                            </div>
                            <p className="mb-4">{route.description}</p>
                            <div>
                              <h4 className="font-medium mb-2">{t.stops}:</h4>
                              <div className="flex flex-wrap gap-2">
                                {route.stops.map((stop, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                                  >
                                    <span>{index + 1}.</span>
                                    <span className="ml-1">{stop}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              className="mt-4 bg-[#5e7a70] hover:bg-[#4a6258]"
                              onClick={() => {
                                if (processingOption) return
                                setProcessingOption(true)
                                setActiveTab("chat")
                                append({
                                  role: "user",
                                  content:
                                    language === "en"
                                      ? `Please tell me more about the ${route.name} route`
                                      : `请详细介绍${route.name}路线`,
                                }).finally(() => setProcessingOption(false))
                              }}
                            >
                              {t.selectRoute}
                            </Button>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
