'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  active?: boolean
  color?: string
  bars?: number
}

export function WaveformVisualizer({
  active = false,
  color = '#6366f1',
  bars = 20,
}: WaveformVisualizerProps) {
  const heightsRef = useRef<number[]>(Array.from({ length: bars }, () => 0.2))
  const animRef = useRef<number | undefined>(undefined)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      const barWidth = canvas!.width / bars
      const maxH = canvas!.height

      heightsRef.current.forEach((h, i) => {
        if (active) {
          const target = 0.2 + Math.random() * 0.8
          heightsRef.current[i] += (target - h) * 0.3
        } else {
          heightsRef.current[i] += (0.15 - h) * 0.2
        }

        const barH = Math.max(4, heightsRef.current[i] * maxH)
        const x = i * barWidth + barWidth * 0.2
        const y = (maxH - barH) / 2

        ctx.fillStyle = color
        ctx.globalAlpha = active ? 0.7 + heightsRef.current[i] * 0.3 : 0.4
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth * 0.6, barH, 2)
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active, color, bars])

  return (
    <canvas
      ref={canvasRef}
      width={bars * 12}
      height={48}
      className="w-full h-12"
    />
  )
}
