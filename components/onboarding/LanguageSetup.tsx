'use client'

import { useState } from 'react'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface LanguageSetupProps {
  defaultLanguage: string
  languageMode: string
  arabicDialect: string
  onChange: (values: {
    defaultLanguage: string
    languageMode: string
    arabicDialect: string
  }) => void
}

const ARABIC_DIALECTS = [
  { value: 'gulf', label: 'Gulf / Saudi' },
  { value: 'egyptian', label: 'Egyptian' },
  { value: 'levantine', label: 'Levantine' },
  { value: 'msa', label: 'Modern Standard Arabic (Formal)' },
]

export function LanguageSetup({ defaultLanguage, languageMode, arabicDialect, onChange }: LanguageSetupProps) {
  const isArabic = defaultLanguage.startsWith('ar')

  function update(key: string, value: string) {
    onChange({
      defaultLanguage: key === 'defaultLanguage' ? value : defaultLanguage,
      languageMode: key === 'languageMode' ? value : languageMode,
      arabicDialect: key === 'arabicDialect' ? value : arabicDialect,
    })
  }

  return (
    <div className="space-y-6">
      {/* Language mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Mode</label>
        <div className="space-y-2">
          {[
            { value: 'adaptive', label: 'Adaptive (recommended)', desc: 'AI automatically follows visitor\'s language' },
            { value: 'fixed', label: 'Fixed', desc: 'AI always responds in your chosen language' },
            { value: 'bilingual', label: 'Bilingual', desc: 'Primary language + one secondary language' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('languageMode', opt.value)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border-2 transition-all',
                languageMode === opt.value
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-indigo-300'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex-shrink-0',
                    languageMode === opt.value
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Default language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
        <select
          value={defaultLanguage}
          onChange={(e) => update('defaultLanguage', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Auto-detect from visitor</option>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <option key={code} value={code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Arabic dialect */}
      {isArabic && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Arabic Dialect</label>
          <div className="grid grid-cols-2 gap-2">
            {ARABIC_DIALECTS.map((d) => (
              <button
                key={d.value}
                onClick={() => update('arabicDialect', d.value)}
                className={cn(
                  'px-3 py-2 rounded-xl border-2 text-sm text-left transition-all',
                  arabicDialect === d.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
