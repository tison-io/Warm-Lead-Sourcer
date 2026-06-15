"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/contexts/SidebarContext"
import { useAuth } from "@/contexts/AuthContext"
import ThemeToggle from "@/components/ThemeToggle"
import { useEffect, useRef } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const { user, logout } = useAuth()
  const sidebarRef = useRef<HTMLElement>(null)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  // Close sidebar on mobile when clicking links
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <aside ref={sidebarRef} className={`
        ${isOpen ? 'w-64' : 'w-16'} 
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700 
        ${isOpen ? 'p-4' : 'p-2'} 
        fixed inset-y-0 left-0 z-40 
        transition-all duration-300 shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 lg:overflow-y-auto lg:h-screen
        overflow-y-hidden h-screen
        lg:${isOpen ? 'w-64' : 'w-16'}
      `}>
        <div className="flex justify-between items-center mb-8">
          <div className={`text-center ${isOpen ? 'block' : 'hidden'}`}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 mx-auto mb-3 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${!isOpen ? 'mx-auto' : ''}`}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

      <nav className="space-y-1">
        <Link 
          href="/dashboard" 
          onClick={handleLinkClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl font-medium transition-all duration-200 ${
            pathname === '/dashboard' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Dashboard"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          {isOpen && <span className="text-sm">Dashboard</span>}
        </Link>

        <Link 
          href="/dashboard/scrapes" 
          onClick={handleLinkClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl font-medium transition-all duration-200 ${
            pathname === '/dashboard/scrapes' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="My Scrapes"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          {isOpen && <span className="text-sm">My Scrapes</span>}
        </Link>

        <Link 
          href="/input-url" 
          onClick={handleLinkClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`} 
          title="New Scrape"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          {isOpen && <span className="text-sm">New Scrape</span>}
        </Link>

        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

        <Link 
          href="/" 
          onClick={handleLinkClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`} 
          title="Home"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          {isOpen && <span className="text-sm">Home</span>}
        </Link>

        <Link 
          href="/privacy-policy" 
          onClick={handleLinkClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 rounded-xl font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`} 
          title="Privacy Policy"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
          </svg>
          {isOpen && <span className="text-sm">Privacy Policy</span>}
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Theme Toggle */}
        <div className={`mb-3 ${isOpen ? 'px-3' : 'flex justify-center'}`}>
          <ThemeToggle />
        </div>

        <button 
          onClick={async () => {
            await logout()
            window.location.href = '/login'
          }}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-3 w-full rounded-xl font-medium transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`} 
          title="Log Out"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          {isOpen && <span className="text-sm">Log Out</span>}
        </button>
      </div>
    </aside>
    </>
  )
}