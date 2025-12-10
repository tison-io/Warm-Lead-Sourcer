"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("message") || "Authentication failed"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="text-gray-600">{errorMessage}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/login")}
            className="w-full rounded-md bg-purple-600 py-6 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Go to Login
          </Button>

          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full rounded-md border-2 border-gray-300 bg-white py-6 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try Sign Up Instead
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
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
      <AuthErrorContent />
    </Suspense>
  )
}
