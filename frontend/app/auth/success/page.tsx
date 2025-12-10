"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get user data from query parameter
    const userParam = searchParams.get("user")
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        // User is authenticated via Google OAuth
        // Cookies are set by the backend, so we can just redirect
        router.push("/dash")
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/login?error=invalid_user_data")
      }
    } else {
      // No user data, redirect to login
      router.push("/login?error=no_user_data")
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}
