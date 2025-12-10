"use client"

import { useState, FormEvent, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

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
      await checkAuth()
      
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-black">Email Verified!</h2>
          <p className="mt-2 text-gray-600">Redirecting you to the app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-black">VERIFY YOUR EMAIL</h1>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to <span className="font-medium text-black">{email}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
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
                    className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg bg-purple-50 text-black focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">Enter the 6-digit code from your email</p>
            </div>

            <Button 
              type="submit"
              disabled={isLoading || code.join("").length !== 6}
              className="w-full rounded-md bg-purple-500 py-6 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "VERIFYING..." : "VERIFY EMAIL"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-700">
            Didn't receive the code?{" "}
            <Link href="/signup" className="text-purple-600 font-medium hover:underline">
              Try again
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden w-1/2 bg-linear-to-br from-gray-100 to-gray-200 lg:block">
        <div className="flex h-full items-center justify-center p-12">
          <div className="relative">
            <Image
              src="/images/signup.png"
              alt="Email verification"
              width={800}
              height={800}
              className="object-contain"
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
