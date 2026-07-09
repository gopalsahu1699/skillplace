'use client'

import { useRef, useEffect, useCallback } from 'react'

interface WatermarkConfig {
  studentName: string
  studentEmail: string
  studentId?: string
  courseTitle?: string
  lessonTitle?: string
}

const WATERMARK_LINES = ['name', 'email'] as const
const WATERMARK_COLOR = 'rgba(255,255,255,0.30)'
const WATERMARK_BG = 'rgba(0,0,0,0.12)'
const WATERMARK_FONT_SIZE = 12
const WATERMARK_ROTATION = -15
const POSITION_COLS = 4
const POSITION_ROWS = 3
const MOVE_INTERVAL_MS = 4000
const RENDER_INTERVAL_MS = 1500

function getPositions(): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  for (let row = 0; row < POSITION_ROWS; row++) {
    for (let col = 0; col < POSITION_COLS; col++) {
      const marginX = 8
      const marginY = 10
      const x = marginX + (col / (POSITION_COLS - 1)) * (100 - 2 * marginX)
      const y = marginY + (row / (POSITION_ROWS - 1)) * (100 - 2 * marginY)
      positions.push({ x, y })
    }
  }
  return positions
}

function getWatermarkLines(config: WatermarkConfig): string[] {
  return [
    config.studentName,
    config.studentEmail,
  ].filter(Boolean)
}

export function useCanvasWatermark(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  config: WatermarkConfig,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const lastRenderRef = useRef(0)
  const positionIdxRef = useRef(0)
  const positionsRef = useRef(getPositions())

  const renderWatermark = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    if (timestamp - lastRenderRef.current < RENDER_INTERVAL_MS) {
      animFrameRef.current = requestAnimationFrame(renderWatermark)
      return
    }
    lastRenderRef.current = timestamp

    const rect = video.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      animFrameRef.current = requestAnimationFrame(renderWatermark)
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const positions = positionsRef.current
    const activeIdx = positionIdxRef.current
    const pos = positions[activeIdx % positions.length]
    const lines = getWatermarkLines(config)

    const fontSize = Math.max(10, WATERMARK_FONT_SIZE * (rect.width / 800))
    ctx.font = `500 ${fontSize}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const x = (pos.x / 100) * rect.width
    const y = (pos.y / 100) * rect.height

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((WATERMARK_ROTATION * Math.PI) / 180)

    const lineHeight = fontSize * 1.5
    const blockWidth = Math.max(...lines.map(l => ctx.measureText(l).width))
    const blockHeight = lines.length * lineHeight + 12
    const padX = 10
    const padY = 6

    ctx.fillStyle = WATERMARK_BG
    const rx = 6
    ctx.beginPath()
    ctx.roundRect(-blockWidth / 2 - padX, -blockHeight / 2 - padY, blockWidth + padX * 2, blockHeight + padY * 2, rx)
    ctx.fill()

    ctx.fillStyle = WATERMARK_COLOR
    lines.forEach((line, i) => {
      if (!line) return
      const ly = -((lines.length - 1) * lineHeight) / 2 + i * lineHeight
      ctx.fillText(line, 0, ly)
    })

    ctx.restore()

    animFrameRef.current = requestAnimationFrame(renderWatermark)
  }, [videoRef, config])

  useEffect(() => {
    const moveInterval = setInterval(() => {
      positionIdxRef.current = (positionIdxRef.current + 1) % positionsRef.current.length
    }, MOVE_INTERVAL_MS)

    return () => {
      clearInterval(moveInterval)
    }
  }, [])

  const startWatermark = useCallback(() => {
    lastRenderRef.current = 0
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(renderWatermark)
  }, [renderWatermark])

  const stopWatermark = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
  }, [])

  return { canvasRef, startWatermark, stopWatermark }
}
