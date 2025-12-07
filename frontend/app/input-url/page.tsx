"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ExtractPage() {
  const [step, setStep] = useState<"input" | "processing" | "error">("input")
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple URL validation - checks if it's a valid URL format
    const urlPattern = /^https?:\/\/.+\..+/
    const isValidUrl = urlPattern.test(url)

    if (isValidUrl) {
      setStep("processing")
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

  if (step === "input") {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="black"/>
              <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#B785FF"/>
              <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#B785FF"/>
              <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#B785FF"/>
            </svg>
            <div>
              <div className="text-lg font-bold leading-tight text-black">Warm leads</div>
              <div className="text-lg font-bold leading-tight text-black">Sourcer</div>
            </div>
          </div>
          <nav className="flex gap-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <Link href="/#how-it-works" className="hover:text-gray-900">
              How it works
            </Link>
            <Link href="/#use-cases" className="hover:text-gray-900">
              Use Cases
            </Link>
            <Link href="/#compliance" className="hover:text-gray-900">
              Privacy & Legal
            </Link>
          </nav>
        </header>

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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="black"/>
              <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#B785FF"/>
              <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#B785FF"/>
              <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#B785FF"/>
            </svg>
            </div>
            <div>
              <div className="text-lg font-bold leading-tight text-black">Warm leads</div>
              <div className="text-lg font-bold leading-tight text-black">Sourcer</div>
            </div>
          </div>
        </header>

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
                style={{ width: "50%" }}
              />

              {steps.map((stepName, index) => (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-4 h-4 rounded-full mb-2 ${index === 3 ? "bg-purple-500" : index < 3 ? "bg-purple-500" : "bg-gray-200"}`}
                  />
                  <span
                    className={`text-xs text-center max-w-80 ${index === 3 ? "text-purple-500 font-medium" : "text-gray-500"}`}
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
