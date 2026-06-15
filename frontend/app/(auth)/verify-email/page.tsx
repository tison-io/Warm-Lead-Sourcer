"use client"

import { useState, FormEvent, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
    inputRefs.current[0]?.focus()
  }, [searchParams])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill("")).slice(0, 6)
    setCode(newCode)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: fullCode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Verification failed")
      }

      setSuccess(true)
      toast.success('Email verified successfully! Welcome to Warm Lead Sourcer!')
      await checkAuth()
      
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Email Verified!</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Redirecting you to the app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <div className="flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white sm:text-base">VERIFY YOUR EMAIL</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              We've sent a 6-digit code to <span className="font-medium text-gray-900 dark:text-white">{email}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-purple-50 dark:bg-gray-800 px-4 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-purple-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-colors"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">Enter the 6-digit code from your email</p>
            </div>

            <Button 
              type="submit"
              disabled={isLoading || code.join("").length !== 6}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 sm:py-4 text-sm sm:text-base font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? "VERIFYING..." : "VERIFY EMAIL"}
            </Button>
          </form>

          <div className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Didn't receive the code?{" "}
            <Link href="/signup" className="text-purple-600 dark:text-purple-400 font-medium hover:underline transition-colors">
              Try again
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden w-1/2 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/20 lg:block">
        <div className="flex h-full items-center justify-center p-8 lg:p-12">
          <div className="relative max-w-lg">
            <Image
              src="/images/signup.png"
              alt="Email verification"
              width={600}
              height={600}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
