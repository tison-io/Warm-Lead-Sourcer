"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { forgotPassword, resetPassword } from "@/lib/api"

export default function AuthFlowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) 
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""]) // 6-digit code
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0) 

  // Countdown timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await forgotPassword({ email })
      setStep(2)
      setResendTimer(60) // 60 second countdown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const codeString = code.join("")
    
    if (codeString.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setError("")
    setIsLoading(true)

    try {
     
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return
    }

    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      setError("")
      
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    // Check password requirements: uppercase, lowercase, number, special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
      return
    }

    const codeString = code.join("")
    if (codeString.length !== 6) {
      setError("Verification code is required")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await resetPassword({
        token: codeString,
        newPassword: newPassword,
      })
      setStep(4)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password. Please try again."
      // Check if it's a code validation error
      if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
        setError(`${errorMessage} You may need to request a new code.`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return

    setError("")
    setIsLoading(true)

    try {
      await forgotPassword({ email })
      setResendTimer(60) // Reset timer
      setCode(["", "", "", "", "", ""]) // Clear code inputs
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="ml-8 max-w-sm pt-16 lg:ml-32">
        {/* Step 1: Forgot Password - Email Entry */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="mb-4 text-xl font-bold text-black">Forgot Password?</h1>
              <p className="text-sm text-gray-600">
                Please verify your email ID to receive a confirmation code to set up new password
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="text-sm font-medium text-black">
                    Email Address
                  </label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="name@gmail.com"
                    required
                    className="w-full text-black rounded-md border border-gray-300 bg-white px-4 py-3 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-purple-600 py-6 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Confirm Email"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-purple-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Verify Email - Code Entry */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-xl font-bold text-black">Verify email address</h2>
              <p className="text-sm text-black">
                verification code sent to <span className="text-purple-600">{email}</span>
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[index]}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="h-16 w-16 rounded-md border border-gray-300 bg-white text-center text-black text-xl font-semibold"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || code.some(digit => digit === "")}
                  className="w-full rounded-md bg-purple-600 py-6 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Confirm code"}
                </Button>
              </form>

              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  {resendTimer > 0 ? (
                    <>
                      <span className="font-semibold text-black">{formatTimer(resendTimer)}</span>{" "}
                      Resend Confirmation Code
                    </>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="font-semibold text-purple-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend Confirmation Code
                    </button>
                  )}
                </p>
                <button
                  onClick={() => {
                    setStep(1)
                    setError("")
                    setCode(["", "", "", "", "", ""])
                    setResendTimer(0)
                  }}
                  className="w-full text-center text-sm text-purple-600 hover:underline"
                >
                  ← Back to email entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-xl font-bold text-black">Reset Password</h2>
              <p className="text-sm text-gray-600">Please enter your new password</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-black">
                    Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter new password"
                    required
                    className="w-full rounded-md border border-gray-300 mt-3 bg-white px-4 py-3 text-sm text-black"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-black">
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Confirm new password"
                    required
                    className="w-full rounded-md border border-gray-300 text-black bg-white px-4 py-3 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-purple-600 py-6 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Confirm Password"}
                </Button>
              </form>

              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  Know your password?{" "}
                  <Link href="/login" className="font-medium text-purple-600 hover:underline">
                    Log in
                  </Link>
                </p>
                <button
                  onClick={() => {
                    setStep(2)
                    setError("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                  className="w-full text-center text-sm text-purple-600 hover:underline"
                >
                  ← Back to code verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-xl font-bold text-black">Password Reset Successful!</h2>
              <p className="text-sm text-gray-600">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>

            <div className="space-y-6">
              <Link href="/login">
                <Button className="w-full rounded-md bg-purple-600 py-6 text-sm font-semibold text-white hover:bg-purple-700">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
