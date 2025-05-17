"use client"

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

// 默认占位图路径 - 使用静态路径而不是动态参数
const DEFAULT_PLACEHOLDER = "/placeholder.jpg"

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * 安全的图片组件，处理加载失败的情况
 * 自动提供默认占位图
 */
export function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = DEFAULT_PLACEHOLDER,
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)
  
  // 确保imgSrc只在客户端设置，避免服务器端/客户端不匹配的问题
  useEffect(() => {
    setImgSrc(typeof src === 'string' ? src : (src as any).src || fallbackSrc)
  }, [src, fallbackSrc])
  
  const handleError = () => {
    console.log(`图片加载失败: ${typeof src === 'string' ? src : 'non-string-src'}, 使用默认图片`)
    setImgSrc(fallbackSrc)
    setError(true)
  }

  // 如果未初始化，返回一个占位符div
  if (imgSrc === null) {
    return <div className="bg-gray-200 animate-pulse" style={{width: '100%', height: '100%'}} />
  }

  return (
    <Image
      {...props}
      src={error ? fallbackSrc : imgSrc}
      alt={alt}
      onError={handleError}
    />
  )
} 