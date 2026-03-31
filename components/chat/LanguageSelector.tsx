'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  currentLanguage: string
  onChange: (lang: string) => void
}

export function LanguageSelector({ currentLanguage, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = SUPPORTED_LANGUAGES[currentLanguage]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span>{current?.flag}</span>
        <span>{currentLanguage.split('-')[0].toUpperCase()}</span>
        <ChevronDown size={10} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => {
                  onChange(code)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors',
                  code === currentLanguage && 'bg-indigo-50 text-indigo-700 font-medium'
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
