"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/ui/loading"

function AuthSuccessContent() {
  const router = useRouter()

  useEffect(() => {
    router.push("/input-url")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
      <Loading />
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loading />
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}
