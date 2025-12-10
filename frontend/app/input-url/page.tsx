"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import Navbar from "@/components/layout/Navbar"

export default function ExtractPage() {
  const [step, setStep] = useState<"input" | "processing" | "error">("input")
  const [url, setUrl] = useState("")
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple URL validation - checks if it's a valid URL format
    const urlPattern = /^https?:\/\/.+\..+/
    const isValidUrl = urlPattern.test(url)

    if (isValidUrl) {
      setStep("processing")
      setCurrentStepIndex(0)
    } else {
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

  // Auto-progress through steps and redirect when complete
  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1
          } else {
            clearInterval(interval)
            // Redirect to results dashboard after final step
            setTimeout(() => {
              router.push("/results-dashboard")
            }, 1000)
            return prev
          }
        })
      }, 2000) // Progress every 2 seconds

      return () => clearInterval(interval)
    }
  }, [step, router, steps.length])

  if (step === "input") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />

        {/* Main Content */}
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-2xl bg-purple-100 rounded-2xl p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <h1 className="text-2xl font-bold text-center text-gray-900">Please enter a valid public post URL.</h1>

              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com..."
                className="w-full h-14 bg-purple-200 border-none text-gray-700 placeholder:text-gray-500"
                required
              />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-12 h-12 rounded-lg"
                >
                  START EXTRACTION
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <h1 className="text-4xl font-bold text-gray-700 mb-4 text-center">Your request is being processed.</h1>
          <p className="text-4xl font-bold text-gray-700 mb-16 text-center">Just a moment.</p>

          {/* Progress Steps */}
          <div className="w-full max-w-4xl mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-purple-500 -translate-y-1/2 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((stepName, index) => (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-4 h-4 rounded-full mb-2 ${
                      index <= currentStepIndex ? "bg-purple-500" : "bg-gray-200"
                    }`}
                  />
                  <span
                    className={`text-xs text-center max-w-80 ${
                      index === currentStepIndex ? "text-purple-500 font-medium" : "text-gray-500"
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Animation */}
          <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-purple-500 rounded-full animate-pulse"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.3 + i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Info Text */}
          <p className="text-gray-600 text-center">
            Did you know? You can export your leads directly to Excel or Sheets.
          </p>
        </main>
      </div>
    )
  }

  // Error page
  return (
    <div className="min-h-screen bg-purple-200 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-black mb-12">404</h1>

        {/* Sad Face */}
        <div className="mb-8">
          <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
            {/* Left eyebrow */}
            <path d="M50 70 Q60 60 75 65" stroke="black" strokeWidth="8" fill="none" strokeLinecap="round" />

            {/* Right eyebrow */}
            <path d="M125 65 Q140 60 150 70" stroke="black" strokeWidth="8" fill="none" strokeLinecap="round" />

            {/* Left eye */}
            <circle cx="70" cy="95" r="25" fill="white" />
            <circle cx="65" cy="100" r="8" fill="black" />

            {/* Right eye */}
            <circle cx="130" cy="95" r="25" fill="white" />
            <circle cx="125" cy="100" r="8" fill="black" />

            {/* Mouth */}
            <ellipse cx="100" cy="145" rx="30" ry="25" fill="black" />
            <ellipse cx="100" cy="135" rx="30" ry="15" fill="#FF6B6B" />
          </svg>
        </div>

        <p className="text-xl text-gray-800 mb-8 max-w-md mx-auto">
          Hmm, that doesn't look like a public post url link.
        </p>

        <button
          onClick={() => setStep("input")}
          className="inline-flex items-center gap-2 text-gray-800 font-medium hover:underline"
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
          Go Home
        </button>
      </div>
    </div>
  )
}
