"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useSidebar } from "@/contexts/SidebarContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen } = useSidebar()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-x-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${
          isOpen ? 'lg:ml-64' : 'lg:ml-16'
        } ml-0`}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}