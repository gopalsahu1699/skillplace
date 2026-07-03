'use client'

const SAMPLE_INTERVAL_MS = 60000
const SAMPLE_QUALITY = 0.3
const SAMPLE_MAX_WIDTH = 320
const SAMPLE_RETRY_ATTEMPTS = 2

export interface ForensicSample {
  lessonId: string
  userId: string
  timestamp: number
  currentTime: number
  imageBase64: string
  userAgent: string
  screenWidth: number
  screenHeight: number
}

export class ForensicSampler {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private lastSampleTime = 0

  constructor(
    private videoRef: React.RefObject<HTMLVideoElement | null>,
    private lessonId: string,
    private userId: string,
  ) {}

  start() {
    if (this.intervalId) return
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.intervalId = setInterval(() => this.capture(), SAMPLE_INTERVAL_MS)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.canvas = null
    this.ctx = null
  }

  private async capture() {
    const video = this.videoRef.current
    if (!video || video.paused || video.ended || !this.ctx || !this.canvas) return
    const now = Date.now()
    if (now - this.lastSampleTime < SAMPLE_INTERVAL_MS * 0.8) return
    this.lastSampleTime = now

    const scale = Math.min(1, SAMPLE_MAX_WIDTH / video.videoWidth)
    this.canvas.width = Math.round(video.videoWidth * scale)
    this.canvas.height = Math.round(video.videoHeight * scale)

    try {
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
      const imageBase64 = this.canvas.toDataURL('image/jpeg', SAMPLE_QUALITY)

      const payload: ForensicSample = {
        lessonId: this.lessonId,
        userId: this.userId,
        timestamp: now,
        currentTime: video.currentTime,
        imageBase64,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      }

      await this.sendSample(payload)
    } catch {}
  }

  private async sendSample(payload: ForensicSample, attempt = 0): Promise<boolean> {
    try {
      const res = await fetch('/api/video/forensic-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch {
      if (attempt < SAMPLE_RETRY_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 2000))
        return this.sendSample(payload, attempt + 1)
      }
      return false
    }
  }
}
