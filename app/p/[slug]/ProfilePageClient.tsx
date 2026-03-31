'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { VoiceOrb } from '@/components/voice/VoiceOrb'
import { WaveformVisualizer } from '@/components/chat/WaveformVisualizer'
import { LanguageSelector } from '@/components/chat/LanguageSelector'
import { Profile, VoiceProfile } from '@/lib/supabase/types'
import { getOrCreateAnonymousId } from '@/lib/utils'
import { startVoiceSession, ConversationSession } from '@/lib/voice/conversational'
import { buildSystemPrompt } from '@/lib/ai/persona-builder'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { MessageSquare, Mic, X } from 'lucide-react'

type PageMode = 'chat' | 'voice'

interface Props {
  profile: Profile
  voiceProfile: VoiceProfile | null
}

export function ProfilePageClient({ profile, voiceProfile }: Props) {
  const [mode, setMode] = useState<PageMode>('chat')
  const [language, setLanguage] = useState(profile.default_language || 'en-US')
  const [conversationId] = useState(() => crypto.randomUUID())
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)
  const [showConsent, setShowConsent] = useState(true)

  // Voice mode state
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'disconnected'>('idle')
  const [voiceTranscript, setVoiceTranscript] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([])
  const sessionRef = useRef<ConversationSession | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const langInfo = SUPPORTED_LANGUAGES[language]
  const isRTL = language.startsWith('ar') || language.startsWith('he') || language.startsWith('fa')

  // Create conversation record on mount
  useEffect(() => {
    initConversation()
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [voiceTranscript])

  async function initConversation() {
    const anonymousId = getOrCreateAnonymousId()
    const res = await fetch('/api/visitors/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymousId, browserLanguage: navigator.language }),
    })
    const { visitor } = await res.json()

    // Create conversation record
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('conversations').insert({
      id: conversationId,
      profile_id: profile.id,
      visitor_id: visitor.id,
      visitor_language: language,
      mode: 'chat',
      messages: [],
    })
  }

  // End conversation on page unload
  useEffect(() => {
    function endConversation() {
      const anonymousId = getOrCreateAnonymousId()
      navigator.sendBeacon(
        '/api/conversations/end',
        JSON.stringify({ conversationId, visitorId: anonymousId })
      )
    }
    window.addEventListener('beforeunload', endConversation)
    return () => window.removeEventListener('beforeunload', endConversation)
  }, [conversationId])

  async function startVoice() {
    if (!profile.voice_mode_enabled || !voiceProfile) return

    const voiceId = voiceProfile.elevenlabs_voice_id || voiceProfile.fallback_voice_id
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''

    // Build system prompt (client-side simplified version)
    const systemPrompt = `You are the AI assistant for ${profile.name}${profile.title ? `, ${profile.title}` : ''}.
${profile.bio || ''}
Be helpful, concise, and professional. Respond in ${langInfo?.name || language}.`

    try {
      sessionRef.current = await startVoiceSession(
        agentId,
        systemPrompt,
        voiceId,
        language,
        profile.name,
        {
          onUserTranscript: (text) => {
            setVoiceTranscript((t) => [...t, { role: 'user', text }])
            setVoiceStatus('listening')
          },
          onAIResponse: (text) => {
            setVoiceTranscript((t) => [...t, { role: 'ai', text }])
          },
          onAudioStart: () => setVoiceStatus('speaking'),
          onAudioEnd: () => setVoiceStatus('listening'),
          onError: (err) => {
            console.error('Voice error:', err)
            setVoiceStatus('disconnected')
          },
          onStatusChange: (status) => {
            if (status === 'connected') setVoiceStatus('listening')
            if (status === 'disconnected') setVoiceStatus('disconnected')
            if (status === 'connecting') setVoiceStatus('connecting')
          },
        }
      )
    } catch (err) {
      setVoiceStatus('disconnected')
    }
  }

  function stopVoice() {
    sessionRef.current?.stop()
    sessionRef.current = null
    setVoiceStatus('idle')
  }

  function switchToVoice() {
    setMode('voice')
    startVoice()
  }

  function switchToChat() {
    stopVoice()
    setMode('chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex flex-col">
      {/* Consent Banner */}
      {showConsent && consentGiven === null && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-700 mb-3">
            Your conversation may be saved to help{' '}
            <span className="font-medium">{profile.name}</span> follow up with you.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setConsentGiven(true); setShowConsent(false) }}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
            >
              Accept & Chat
            </button>
            <button
              onClick={() => { setConsentGiven(false); setShowConsent(false) }}
              className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
            >
              Chat without saving
            </button>
          </div>
        </div>
      )}

      {mode === 'chat' && (
        <div className="flex flex-col h-screen max-w-2xl mx-auto w-full">
          {/* Mode toggle bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setMode('chat')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-900 shadow-sm"
              >
                <MessageSquare size={12} />
                Chat
              </button>
              {profile.voice_mode_enabled && (
                <button
                  onClick={switchToVoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  <Mic size={12} />
                  Voice
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{langInfo?.flag}</span>
              <LanguageSelector currentLanguage={language} onChange={setLanguage} />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatInterface
              profile={profile}
              conversationId={conversationId}
              onLanguageChange={setLanguage}
              voiceEnabled={profile.voice_enabled}
              onSwitchToVoice={profile.voice_mode_enabled ? switchToVoice : undefined}
            />
          </div>
        </div>
      )}

      {mode === 'voice' && (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* Background */}
          {profile.avatar_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5"
              style={{ backgroundImage: `url(${profile.avatar_url})` }}
            />
          )}

          {/* Controls */}
          <div className="relative z-10 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{profile.name}</p>
                {profile.title && <p className="text-xs text-gray-500">{profile.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {langInfo?.flag}
                <LanguageSelector currentLanguage={language} onChange={setLanguage} />
              </div>
              <button
                onClick={switchToChat}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur text-gray-600 rounded-full text-xs border border-gray-200 hover:bg-white"
              >
                <MessageSquare size={12} />
                Chat
              </button>
            </div>
          </div>

          {/* Orb */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
            <VoiceOrb
              status={voiceStatus}
              onTap={() => {
                if (voiceStatus === 'idle' || voiceStatus === 'disconnected') {
                  startVoice()
                }
              }}
              profileAvatar={profile.avatar_url || undefined}
            />

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                {voiceStatus === 'idle' && 'Tap to start voice conversation'}
                {voiceStatus === 'connecting' && 'Connecting...'}
                {voiceStatus === 'listening' && 'Listening...'}
                {voiceStatus === 'speaking' && `${profile.name}'s AI is speaking`}
                {voiceStatus === 'disconnected' && 'Disconnected — tap to reconnect'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {langInfo?.flag} {langInfo?.name}
              </p>
            </div>

            {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
              <WaveformVisualizer active={voiceStatus === 'speaking'} />
            )}
          </div>

          {/* Transcript */}
          {voiceTranscript.length > 0 && (
            <div className="relative z-10 mx-4 mb-4 bg-white/80 backdrop-blur rounded-2xl p-4 max-h-48 overflow-y-auto">
              {voiceTranscript.slice(-6).map((item, i) => (
                <div
                  key={i}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={`text-sm mb-2 ${
                    item.role === 'user' ? 'text-gray-900 font-medium' : 'text-indigo-700'
                  }`}
                >
                  <span className="text-xs text-gray-400 mr-1">
                    {item.role === 'user' ? 'You' : profile.name}:
                  </span>
                  {item.text}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}

          {/* Stop button */}
          {voiceStatus !== 'idle' && voiceStatus !== 'disconnected' && (
            <div className="relative z-10 flex justify-center pb-8">
              <button
                onClick={stopVoice}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600"
              >
                <X size={16} />
                End conversation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
