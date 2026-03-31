'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceOrbProps {
  status: 'idle' | 'connecting' | 'listening' | 'speaking' | 'disconnected'
  onTap?: () => void
  profileAvatar?: string
}

export function VoiceOrb({ status, onTap, profileAvatar }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      phaseRef.current += 0.05

      const isActive = status === 'listening' || status === 'speaking'
      const baseR = 80
      const pulseAmplitude = isActive ? 20 : 5
      const r = baseR + Math.sin(phaseRef.current) * pulseAmplitude

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        const ringR = r + i * 18
        const alpha = isActive ? (0.15 - i * 0.04) : 0.05
        const grad = ctx.createRadialGradient(cx, cy, ringR * 0.5, cx, cy, ringR)
        grad.addColorStop(0, `rgba(99,102,241,${alpha})`)
        grad.addColorStop(1, 'rgba(99,102,241,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Main orb
      const orbGrad = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, r)
      if (status === 'speaking') {
        orbGrad.addColorStop(0, '#818cf8')
        orbGrad.addColorStop(1, '#4338ca')
      } else if (status === 'listening') {
        orbGrad.addColorStop(0, '#6ee7b7')
        orbGrad.addColorStop(1, '#059669')
      } else {
        orbGrad.addColorStop(0, '#a5b4fc')
        orbGrad.addColorStop(1, '#6366f1')
      }

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = orbGrad
      ctx.shadowBlur = isActive ? 30 : 10
      ctx.shadowColor = status === 'listening' ? '#059669' : '#6366f1'
      ctx.fill()
      ctx.shadowBlur = 0

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [status])

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} width={260} height={260} className="absolute" />
      <button
        onClick={onTap}
        className={cn(
          'relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-transform',
          status === 'idle' && 'hover:scale-105 cursor-pointer',
          status === 'connecting' && 'cursor-wait'
        )}
        style={{ width: 160, height: 160 }}
      >
        {profileAvatar ? (
          <img
            src={profileAvatar}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover opacity-80"
          />
        ) : status === 'connecting' ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : status === 'listening' ? (
          <Mic className="w-10 h-10 text-white" />
        ) : status === 'disconnected' ? (
          <MicOff className="w-10 h-10 text-white/60" />
        ) : (
          <Mic className="w-10 h-10 text-white/80" />
        )}
      </button>
    </div>
  )
}
