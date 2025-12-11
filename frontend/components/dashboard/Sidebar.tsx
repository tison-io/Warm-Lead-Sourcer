"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/contexts/SidebarContext"
import { useAuth } from "@/contexts/AuthContext"
import ThemeToggle from "@/components/ThemeToggle"

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const { user, logout } = useAuth()

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`${isOpen ? 'w-60' : 'w-16'} bg-purple-100 dark:bg-gray-800 ${isOpen ? 'p-4' : 'p-2'} fixed h-full overflow-y-auto z-40 transition-all duration-300`}>
        <div className="flex justify-between items-center mb-8">
          <div className={`text-center ${isOpen ? 'block' : 'hidden'}`}>
        <div className="w-20 h-20 rounded-full bg-purple-300 dark:bg-purple-600 mx-auto mb-2 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="35" r="18" fill="#8B5CF6"/>
            <circle cx="50" cy="75" r="30" fill="#8B5CF6"/>
          </svg>
        </div>
            <p className="font-semibold text-black dark:text-white">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-purple-200 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

      <nav className="space-y-2">
        <Link 
          href="/dashboard" 
          className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 rounded-lg font-bold transition-colors ${
            pathname === '/dashboard' 
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
          }`}
          title="Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
            <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
            <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
            <rect x="14" y="14" width="7" height="7" fill="currentColor"/>
          </svg>
          {isOpen && <span>Dashboard</span>}
        </Link>

        <Link 
          href="/dashboard/scrapes" 
          className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 rounded-lg font-bold transition-colors ${
            pathname === '/dashboard/scrapes' 
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
          }`}
          title="My Scrapes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {isOpen && <span>My Scrapes</span>}
        </Link>

        <Link href="/input-url" className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 font-bold transition-colors`} title="New Scrape">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {isOpen && <span>New Scrape</span>}
        </Link>

        <Link href="/" className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 font-bold transition-colors`} title="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {isOpen && <span>Home</span>}
        </Link>

        <Link href="/privacy-policy" className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 font-bold transition-colors`} title="Privacy Policy">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {isOpen && <span>Privacy Policy</span>}
        </Link>
      </nav>

      {/* Theme Toggle */}
      <div className={`mt-4 ${isOpen ? 'px-4' : 'flex justify-center'}`}>
        <ThemeToggle />
      </div>

      <button 
        onClick={async () => {
          await logout()
          window.location.href = '/login'
        }}
        className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2 mt-4 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors`} 
        title="Log Out"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {isOpen && <span>Log Out</span>}
      </button>
    </aside>
    </>
  )
}