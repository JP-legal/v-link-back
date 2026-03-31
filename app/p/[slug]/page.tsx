import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ProfilePageClient } from './ProfilePageClient'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, title, bio, avatar_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!profile) return { title: 'Profile not found' }

  return {
    title: `${profile.name} — AI Assistant | AURA`,
    description: profile.bio || `Chat with ${profile.name}'s AI assistant`,
    openGraph: {
      title: `Chat with ${profile.name}'s AI`,
      description: profile.bio || `${profile.name} is available 24/7 via AI`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!profile) notFound()

  const { data: voiceProfile } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('profile_id', profile.id)
    .single()

  return <ProfilePageClient profile={profile} voiceProfile={voiceProfile} />
}
