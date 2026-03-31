'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface AudioPlayerProps {
  src: string
  title?: string
  showDownload?: boolean
}

export function AudioPlayer({ src, title, showDownload }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
      <button
        onClick={toggle}
        className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 flex-shrink-0"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        {title && <p className="text-xs font-medium text-gray-700 truncate mb-1">{title}</p>}
        <div className="relative h-1.5 bg-gray-200 rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const t = Number(e.target.value)
              if (audioRef.current) audioRef.current.currentTime = t
              setCurrentTime(t)
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      {showDownload && (
        <a
          href={src}
          download
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <Download size={16} />
        </a>
      )}

      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}
