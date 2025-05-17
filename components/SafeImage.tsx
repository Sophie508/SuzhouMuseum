"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

// 默认占位图路径
const DEFAULT_PLACEHOLDER = "/placeholder.svg?height=400&width=400"

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
  const [imgSrc, setImgSrc] = useState(src)
  
  const handleError = () => {
    console.log(`图片加载失败: ${src}, 使用默认图片`)
    setImgSrc(fallbackSrc)
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  )
} 