"use client"

import Image from "next/image"
import Link from "next/link"
import { UserCircle2, Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Transition } from '@headlessui/react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    // 添加监听窗口大小变化的事件，在宽屏时关闭移动菜单
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 处理移动菜单的点击
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // 关闭移动菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-[#f8f7f5]/90 fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="苏州博物馆" width={50} height={50} className="h-8 w-8 sm:h-10 sm:w-10" />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-12">
            <Link href="/" className="text-black hover:text-gray-600 transition-colors font-medium">
              HOME
            </Link>
            <Link href="/exhibitions" className="text-black hover:text-gray-600 transition-colors font-medium">
              EXHIBITIONS
            </Link>
            <Link href="/collections" className="text-black hover:text-gray-600 transition-colors font-medium">
              COLLECTIONS
            </Link>
            <Link href="/ai-guide" className="text-black hover:text-gray-600 transition-colors font-medium whitespace-nowrap">
              EXPLORE WITH AI
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full w-10 h-10 p-0 border-gray-300">
            <UserCircle2 className="h-6 w-6" />
            <span className="sr-only">User account</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="block md:hidden rounded-full w-10 h-10 p-0 transition-colors" 
            onClick={handleMobileMenuToggle}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* 移动菜单 */}
      {isMounted && (
        <div 
          id="mobile-menu"
          className={`fixed inset-0 top-[72px] z-40 transform transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm shadow-lg">
            <nav className="flex flex-col items-center p-6 space-y-4 max-w-md mx-auto pt-8">
              <Link 
                href="/" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={closeMobileMenu}
              >
                HOME
              </Link>
              <Link 
                href="/exhibitions" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={closeMobileMenu}
              >
                EXHIBITIONS
              </Link>
              <Link 
                href="/collections" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={closeMobileMenu}
              >
                COLLECTIONS
              </Link>
              <Link 
                href="/ai-guide" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={closeMobileMenu}
              >
                EXPLORE WITH AI GUIDE
              </Link>
            </nav>
          </div>
        </div>
      )}

      <div className="relative w-full h-screen">
        <Image src="/suzhou-garden-clean.png" alt="苏州园林风景" fill priority className="object-cover" />

        {/* Modified content container for better mobile responsiveness */}
        <div className="absolute inset-0 overflow-auto pt-[72px]">
          <div className="min-h-full flex flex-col items-center justify-center text-center px-4 py-12 sm:py-0">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-black leading-tight mb-6 sm:mb-8 mt-12 sm:mt-0">
                Discover
                <br />
                the treasures
                <br />
                of Suzhou
              </h1>

              <div className="mt-8 sm:mt-10 bg-white bg-opacity-80 backdrop-blur-sm p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
                <h2 className="text-xl font-medium mb-4">苏州博物馆参观体验流程</h2>
                <div className="flex flex-col md:flex-row items-center justify-between max-w-3xl mx-auto">
                  <div className="flex flex-col items-center mb-6 md:mb-0">
                    <div className="w-16 h-16 rounded-full bg-[#5e7a70] text-white flex items-center justify-center text-xl font-semibold">1</div>
                    <div className="mt-2 font-medium">参观规划</div>
                    <div className="text-sm text-gray-600">藏品时间轴与参观时长</div>
                  </div>
                  
                  <ArrowRight className="hidden md:block h-6 w-6 text-[#5e7a70]" />
                  <div className="w-px h-8 md:hidden bg-[#5e7a70]"></div>
                  
                  <div className="flex flex-col items-center mb-6 md:mb-0">
                    <div className="w-16 h-16 rounded-full bg-[#5e7a70] text-white flex items-center justify-center text-xl font-semibold">2</div>
                    <div className="mt-2 font-medium">参观导览</div>
                    <div className="text-sm text-gray-600">生肖与MBTI匹配</div>
                  </div>
                  
                  <ArrowRight className="hidden md:block h-6 w-6 text-[#5e7a70]" />
                  <div className="w-px h-8 md:hidden bg-[#5e7a70]"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#5e7a70] text-white flex items-center justify-center text-xl font-semibold">3</div>
                    <div className="mt-2 font-medium">参观回顾</div>
                    <div className="text-sm text-gray-600">藏品测验与总结</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pre-visit" className="w-full sm:w-auto">
                  <Button className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-4 sm:px-6 md:px-8 py-3 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg w-full">
                    PRE-VISIT EXPERIENCE
                  </Button>
                </Link>
                <Link href="/during-visit" className="w-full sm:w-auto">
                  <Button className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-4 sm:px-6 md:px-8 py-3 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg w-full">
                    DURING VISIT
                  </Button>
                </Link>
                <Link href="/post-visit" className="w-full sm:w-auto">
                  <Button className="bg-[#5e7a70] hover:bg-[#4a6258] text-white rounded-full px-4 sm:px-6 md:px-8 py-3 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg w-full">
                    POST-VISIT REVIEW
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
