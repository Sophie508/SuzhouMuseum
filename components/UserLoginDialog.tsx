"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createUserWithUniqueNickname } from "@/lib/user-service"

interface UserLoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess: () => void
}

export function UserLoginDialog({ open, onOpenChange, onLoginSuccess }: UserLoginDialogProps) {
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError("请输入昵称")
      return
    }

    if (nickname.length < 2) {
      setError("昵称至少需要2个字符")
      return
    }

    if (nickname.length > 20) {
      setError("昵称不能超过20个字符")
      return
    }

    setIsSubmitting(true)
    
    try {
      // 创建用户（如果昵称已存在会自动添加后缀）
      const user = createUserWithUniqueNickname(nickname.trim())
      
      // 如果创建的用户昵称与输入不同，显示提示
      if (user.nickname !== nickname.trim()) {
        setError(`昵称 "${nickname}" 已被使用，已为您分配昵称 "${user.nickname}"`)
      }
      
      // 返回成功
      setTimeout(() => {
        setIsSubmitting(false)
        onLoginSuccess()
      }, 1000)
    } catch (err) {
      setIsSubmitting(false)
      setError("创建用户时出错，请重试")
    }
  }

  const handleClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setNickname("")
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>欢迎访问苏州博物馆</DialogTitle>
          <DialogDescription>
            请输入您的昵称，我们将为您提供个性化的参观体验
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              placeholder="请输入昵称（2-20个字符）"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError(null)
              }}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "正在保存..." : "开始参观"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}