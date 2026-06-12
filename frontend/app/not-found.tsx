'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/loading'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/error?type=not-found&message=Page not found')
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <Loading text="Redirecting" size="md" />
    </div>
  )
}