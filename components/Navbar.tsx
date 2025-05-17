"use client"

import Image from "next/image"
import Link from "next/link"
import { UserCircle2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Transition } from '@headlessui/react'

export function Navbar({ transparent = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // 客户端渲染后才能使用window
  useEffect(() => {
    setIsMounted(true)
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])
  
  // 计算header的背景样式
  const headerBgClass = () => {
    if (!transparent) return "bg-white shadow-sm"
    return scrolled ? "bg-white shadow-sm transition-all duration-300" : "bg-[#f8f7f5]/80 transition-all duration-300"
  }

  return (
    <>
      <header className={`w-full py-4 px-4 sm:px-6 md:px-12 flex items-center justify-between fixed top-0 left-0 right-0 z-50 ${headerBgClass()}`}>
        <div className="flex items-center gap-6 md:gap-12">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="苏州博物馆" width={50} height={50} className="h-10 w-10" />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-12">
            <Link href="/" className="text-black hover:text-gray-600 transition-colors font-medium text-sm lg:text-base">
              HOME
            </Link>
            <Link href="/exhibitions" className="text-black hover:text-gray-600 transition-colors font-medium text-sm lg:text-base">
              EXHIBITIONS
            </Link>
            <Link href="/collections" className="text-black hover:text-gray-600 transition-colors font-medium text-sm lg:text-base">
              COLLECTIONS
            </Link>
            <Link href="/ai-guide" className="text-black hover:text-gray-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">
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
            className="md:hidden rounded-full w-10 h-10 p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </header>

      {/* 移动菜单 */}
      {isMounted && (
        <Transition
          show={isMobileMenuOpen}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 top-[72px] bg-white/95 backdrop-blur-sm z-40 md:hidden overflow-y-auto">
            <nav className="flex flex-col items-center p-6 space-y-4 max-w-md mx-auto">
              <Link 
                href="/" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link 
                href="/exhibitions" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                EXHIBITIONS
              </Link>
              <Link 
                href="/collections" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                COLLECTIONS
              </Link>
              <Link 
                href="/ai-guide" 
                className="text-lg font-medium w-full text-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                EXPLORE WITH AI GUIDE
              </Link>
            </nav>
          </div>
        </Transition>
      )}
    </>
  )
} 