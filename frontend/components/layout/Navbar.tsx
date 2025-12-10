'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  const getInitials = () => {
    if (!user || !user.firstName || !user.lastName) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/90 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
        </div>
      </nav>
    );
  }

  return (
    <>
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/90 border-b border-gray-200/50 dark:border-slate-700/50 transition-all duration-300 shadow-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 sm:h-8 md:h-9 w-auto transition-transform group-hover:scale-105">
              <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="currentColor" className="text-slate-800 dark:text-slate-100"/>
              <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#A960FF"/>
              <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#8300DD"/>
              <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#4B0082"/>
            </svg>
            <div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Warm leads</div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Sourcer</div>
            </div>
          </Link>

          {/* Hamburger Menu (Mobile/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Navigation Links - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden xl:flex items-center gap-8">
            <Link href="/" className="relative text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group">
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#how-it-works" className="relative text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group">
              <span>How it works</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#use-cases" className="relative text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group">
              <span>Use Cases</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#compliance" className="relative text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group">
              <span>Privacy & Legal</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-800 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Right Side Actions (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-2 sm:gap-3 md:gap-4">

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition-all duration-200 group"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-orange-400 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-700 group-hover:rotate-[360deg] transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-200 dark:ring-purple-900"
                >
                  {getInitials()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/dash"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signup">
                  <Button 
                    variant="outline"
                    className="hidden md:inline-flex rounded-xl border-2 border-purple-500 bg-transparent px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-[15px] font-medium text-purple-600 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    className="rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-[15px] font-medium text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Drawer */}
    {mobileMenuOpen && (
      <div className="xl:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-40 shadow-xl border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col p-6 space-y-4">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#use-cases"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Cases
            </Link>
            <Link
              href="#compliance"
              className="text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Privacy & Legal
            </Link>
          </nav>

          <div className="border-t border-gray-200 dark:border-slate-700" />

          {/* Auth Section */}
          {user ? (
            <div className="flex flex-col space-y-4">
              <div className="px-4 py-3 bg-purple-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
              <Link
                href="/dash"
                className="text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg transition-all">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl border-2 border-purple-500 bg-transparent px-6 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                  Login
                </Button>
              </Link>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-slate-700" />

          {/* Theme Toggle */}
          <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</span>
                </>
              )}
            </button>
        </div>
      </div>
    )}
    </>
  );
}
