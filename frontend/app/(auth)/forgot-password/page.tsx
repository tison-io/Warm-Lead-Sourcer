"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { forgotPassword, resetPassword } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await forgotPassword({ email })
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setStep(3)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    const fullCode = code.join("")
    setError("")
    setIsLoading(true)

    try {
      await resetPassword({ token: fullCode, newPassword })
      setTimeout(() => router.push("/login"), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {step === 1 && (
            <>
              <div className="text-center">
                <h1 className="text-sm font-semibold uppercase tracking-wide text-black">FORGOT PASSWORD</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email to receive a verification code
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                    className="w-full rounded-md border border-gray-300 bg-purple-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-purple-500 py-6 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {isLoading ? "SENDING..." : "SEND CODE"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-700">
                Remember your password?{" "}
                <Link href="/login" className="text-purple-600 font-medium hover:underline">
                  Log in
                </Link>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <h1 className="text-sm font-semibold uppercase tracking-wide text-black">VERIFY CODE</h1>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to <span className="font-medium text-black">{email}</span>
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-4">
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
                  className="w-full rounded-md bg-purple-500 py-6 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {isLoading ? "VERIFYING..." : "VERIFY CODE"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-700">
                Didn't receive the code?{" "}
                <button onClick={(e) => { e.preventDefault(); handleEmailSubmit(e as React.FormEvent); }} className="text-purple-600 font-medium hover:underline">
                  Resend
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center">
                <h1 className="text-sm font-semibold uppercase tracking-wide text-black">RESET PASSWORD</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your new password
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-black">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      required
                      minLength={8}
                      className="w-full rounded-md border border-gray-300 bg-purple-50 px-4 py-3 pr-10 text-sm text-black placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-purple-600">
                    Must have at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      minLength={8}
                      className="w-full rounded-md border border-gray-300 bg-purple-50 px-4 py-3 pr-10 text-sm text-black placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-purple-500 py-6 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {isLoading ? "RESETTING..." : "RESET PASSWORD"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="hidden w-1/2 bg-linear-to-br from-gray-100 to-gray-200 lg:block">
        <div className="flex h-full items-center justify-center p-12">
          <div className="relative">
            <Image
              src="/images/signup.png"
              alt="Password reset"
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
