import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile not found</h1>
        <p className="text-gray-500 mb-6">This AURA profile doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link href="/" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
          Go to AURA
        </Link>
      </div>
    </div>
  )
}
