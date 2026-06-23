'use client'
import { useState, useEffect } from 'react'

interface VideoWatermarkProps {
  email: string
}

export default function VideoWatermark({ email }: VideoWatermarkProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute text-white text-sm font-semibold opacity-40 pointer-events-none z-10 select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        transform: 'rotate(-15deg)',
      }}
    >
      {email}
    </div>
  )
}
