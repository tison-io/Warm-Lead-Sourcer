'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Application Error</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A critical error occurred. Please refresh the page or try again later.
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={reset}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-medium transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}