"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserLoginDialog } from "@/components/UserLoginDialog"
import { TimePeriodSelector } from "@/components/TimePeriodSelector"
import { VisitDurationSelector } from "@/components/VisitDurationSelector"
import { 
  getCurrentUserId, 
  getUserById, 
  updateUserPreferences
} from "@/lib/user-service"
import { UserPreference } from "@/lib/user-model"

export default function PreVisitPage() {
  const [loading, setLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(true)
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    visitPeriod: "",
    zodiacSign: "",
    mbtiType: "",
    visitDuration: 60
  })
  
  // 检查用户登录状态
  useEffect(() => {
    const userId = getCurrentUserId()
    if (userId) {
      const user = getUserById(userId)
      if (user) {
        setShowLoginDialog(false)
        // 加载用户偏好设置
        setUserPreferences(user.preferences)
      }
    }
  }, [])

  // 更新用户偏好
  const updatePreference = (key: keyof UserPreference, value: any) => {
    setUserPreferences((prev: UserPreference) => ({
      ...prev,
      [key]: value
    }))
  }
  
  // 保存用户偏好
  const savePreferences = () => {
    // 更新用户偏好
    const userId = getCurrentUserId()
    if (userId) {
      updateUserPreferences(userId, userPreferences)
    }
  }
  
  // 用户登录成功
  const handleLoginSuccess = () => {
    setShowLoginDialog(false)
  }
  
  return (
    <main className="min-h-screen bg-[#f8f7f5] flex flex-col">
      {/* 顶部导航 */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-[#5e7a70]">
          <ArrowLeft className="h-5 w-5" />
          <span>返回首页</span>
        </Link>
        <div className="text-xl font-medium">参观规划</div>
        <div className="w-24"></div>
      </header>
      
      {/* 进度条 */}
      <div className="w-full px-6 md:px-12 py-4">
        <Progress value={100} className="h-2" />
      </div>
      
      <div className="flex-grow p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif mb-2">选择感兴趣的藏品年代</h2>
            <p className="text-gray-600 mb-8">
              请选择您最感兴趣的历史年代和计划参观时长，我们将为您推荐相关藏品
            </p>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">以下是苏州博物馆收录的藏品的时间轴</h3>
                <TimePeriodSelector 
                  value={userPreferences.visitPeriod}
                  onChange={(value) => updatePreference('visitPeriod', value)}
                />
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">您计划参观多长时间？</h3>
                <VisitDurationSelector
                  value={userPreferences.visitDuration}
                  onChange={(value) => updatePreference('visitDuration', value)}
                />
              </CardContent>
            </Card>
            
            <div className="mt-12 flex justify-end">
              <Link href="/during-visit">
                <Button 
                  onClick={savePreferences} 
                  className="flex items-center gap-2" 
                  size="lg"
                >
                  开始参观
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* 用户登录对话框 */}
      <UserLoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </main>
  )
} 