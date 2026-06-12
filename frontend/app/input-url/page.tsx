"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"
import Navbar from "@/components/layout/Navbar"
import toast from "react-hot-toast"

export default function ExtractPage() {
  const [step, setStep] = useState<"input" | "processing" | "error">("input")
  const [url, setUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const prefilledUrl = urlParams.get('url')
      return prefilledUrl ? decodeURIComponent(prefilledUrl) : ""
    }
    return ""
  })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [postId, setPostId] = useState<string | null>(null)

  const router = useRouter()

  // Handle auto-start from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const autoStart = urlParams.get('autoStart')
      
      if (autoStart === 'true') {
        // Auto-start processing after a brief delay
        setTimeout(() => {
          const form = document.querySelector('form') as HTMLFormElement
          if (form) {
            form.requestSubmit()
          }
        }, 100)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()


    // Simple URL validation - checks if it's a valid URL format
    const urlPattern = /^https?:\/\/.+\..+/
    const isValidUrl = urlPattern.test(url)

    if (!isValidUrl) {
      toast.error("Please enter a valid LinkedIn post URL")
      return
    }

    try {
      setStep("processing")
      setCurrentStepIndex(0)
      
      // Create post entry (processing starts automatically)
      const postResponse = await api.post('/posts', {
        url
      })
      
      const createdPostId = postResponse._id
      setPostId(createdPostId)
      
    } catch (err) {
      console.error('Failed to start extraction:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start extraction'
      toast.error(errorMessage)
      setStep("error")
    }
  }

  const steps = [
    "Validating post",
    "Reading interactions",
    "Collecting profiles",
    "Enriching data",
    "Scoring leads",
    "Finalizing results",
  ]

  // Auto-progress through steps and check status
  useEffect(() => {
    if (step === "processing" && postId) {
      const checkStatus = async () => {
        try {
          const response = await api.get(`/posts/${postId}`)
          
          console.log('Post status:', response.status, response)
          
          if (response.status === 'completed') {
            setCurrentStepIndex(steps.length - 1)
            toast.success('Processing completed! Redirecting to results...')
            setTimeout(() => {
              router.push(`/dashboard/results?postId=${postId}`)
            }, 1000)
            return
          }
          
          if (response.status === 'failed') {
            const errorMsg = response.errorMessage || 'Processing failed. Please try again.'
            toast.error(errorMsg)
            setStep('error')
            return
          }
          
          if (response.status === 'processing') {
            // Continue polling
            return
          }
        } catch (err) {
          console.error('Failed to check status:', err)
          toast.error('Failed to check processing status')
        }
      }

      // Progress through UI steps while checking real status
      const progressInterval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 2000)

      // Check actual processing status
      const statusInterval = setInterval(checkStatus, 3000)
      checkStatus() // Initial check

      return () => {
        clearInterval(progressInterval)
        clearInterval(statusInterval)
      }
    }
  }, [step, postId, router, steps.length])

  if (step === "input") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-slate-900">
          <Navbar />

          {/* Main Content */}
          <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
            <div className="w-full max-w-2xl bg-purple-100 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white leading-tight">
                  Please enter a valid public post URL.
                </h1>



                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.linkedin.com..."
                  className="w-full h-12 sm:h-14 bg-purple-200 dark:bg-gray-700 border-none text-gray-700 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base rounded-xl"
                  required
                  autoFocus
                />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold px-8 sm:px-12 h-12 sm:h-14 rounded-xl text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    START EXTRACTION
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (step === "processing") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
          <Navbar />

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 pb-20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-200 mb-2 sm:mb-4 text-center leading-tight">
              Your request is being processed.
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-200 mb-8 sm:mb-12 lg:mb-16 text-center leading-tight">
              Just a moment.
            </p>

            {/* Progress Steps */}
            <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mb-8 sm:mb-12">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                <div
                  className="absolute top-1/2 left-0 h-0.5 bg-purple-500 dark:bg-purple-400 -translate-y-1/2 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((stepName, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mb-1 sm:mb-2 ${
                        index <= currentStepIndex ? "bg-purple-500 dark:bg-purple-400" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                    <span
                      className={`text-xs sm:text-sm text-center max-w-16 sm:max-w-20 lg:max-w-24 leading-tight ${
                        index === currentStepIndex ? "text-purple-500 dark:text-purple-400 font-medium" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Animation */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8 sm:mb-12">
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-30px) sm:translateY(-40px)`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.3 + i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Info Text */}
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base px-4">
              Did you know? You can export your leads directly to Excel or Sheets.
            </p>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Error page
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-purple-200 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-black dark:text-white mb-8 sm:mb-12">Error</h1>
          


          {/* Sad Face */}
          <div className="mb-6 sm:mb-8">
            <svg width="150" height="150" viewBox="0 0 200 200" className="mx-auto sm:w-[200px] sm:h-[200px]">
              {/* Left eyebrow */}
              <path d="M50 70 Q60 60 75 65" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" className="text-black dark:text-white" />

              {/* Right eyebrow */}
              <path d="M125 65 Q140 60 150 70" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" className="text-black dark:text-white" />

              {/* Left eye */}
              <circle cx="70" cy="95" r="25" fill="white" className="dark:fill-gray-200" />
              <circle cx="65" cy="100" r="8" fill="black" className="dark:fill-gray-800" />

              {/* Right eye */}
              <circle cx="130" cy="95" r="25" fill="white" className="dark:fill-gray-200" />
              <circle cx="125" cy="100" r="8" fill="black" className="dark:fill-gray-800" />

              {/* Mouth */}
              <ellipse cx="100" cy="145" rx="30" ry="25" fill="black" className="dark:fill-white" />
              <ellipse cx="100" cy="135" rx="30" ry="15" fill="#FF6B6B" />
            </svg>
          </div>

          <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 mb-6 sm:mb-8 px-4 leading-relaxed">
            Hmm, that doesn't look like a public post url link.
          </p>

          <button
            onClick={() => setStep("input")}
            className="inline-flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium hover:underline text-sm sm:text-base transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}