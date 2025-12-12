"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("message") || searchParams.get("error") || "Authentication failed"
  const errorType = searchParams.get("type") || "auth"

  const getErrorDetails = () => {
    switch (errorType) {
      case 'server':
        return {
          title: 'Server Error',
          description: 'Our servers are experiencing issues. Please try again later.',
          icon: (
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to our servers. Check your internet connection.',
          icon: (
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          )
        }
      case 'not-found':
        return {
          title: 'Page Not Found',
          description: "The page you're looking for doesn't exist or hasn't been implemented yet.",
          icon: (
            <div className="text-6xl font-bold text-purple-600 dark:text-purple-400">404</div>
          ),
          showImage: true
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'There was a problem with your authentication.',
          icon: (
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )
        }
    }
  }

  const { title, description, icon } = getErrorDetails()

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-4">
          {getErrorDetails().showImage ? (
            <div className="w-48 h-48 mx-auto mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/signup.png" 
                alt="Error illustration" 
                className="w-full h-full object-contain opacity-75"
              />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              {icon}
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
            {errorMessage !== title && errorType !== 'not-found' && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {errorType === 'server' || errorType === 'network' ? (
            <Button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Try Again
            </Button>
          ) : errorType === 'not-found' ? (
            <Button
              onClick={() => router.back()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Go Back
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Go to Login
            </Button>
          )}

          {errorType !== 'not-found' && (
            <>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 py-3 text-sm font-medium transition-all"
              >
                Go Back
              </Button>
              
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-3 text-sm font-medium transition-all"
                >
                  Go Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
