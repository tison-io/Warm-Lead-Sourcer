'use client';

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user } = useAuth();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const router = useRouter();

  const useCaseCards = [
    {
      id: 1,
      title: "Recruiters",
      description: "Identify passive candidates who have proven expertise and alignment before you even send the first message.",
      image: "/images/Recruiters.jpg",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      id: 2,
      title: "Founders",
      description: "Identify early adopters, key advocates, and potential investors who are already bought into your vision and product story.",
      image: "/images/Founders.jpg",
      bgColor: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
      id: 3,
      title: "Growth",
      description: "Focus your sales efforts exclusively on pre-qualified leads with a higher probability of conversion and a shorter sales cycle.",
      image: "/images/Growth.jpg",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % useCaseCards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [useCaseCards.length]);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-700 hover:text-black">
             How it works
            </Link>
            <Link href="#use-cases" className="text-sm text-gray-700 hover:text-black">
              Use Cases
            </Link>
            <Link href="#compliance" className="text-sm text-gray-700 hover:text-black">
            Legal
            </Link>
             <Link href="/privacy-policy" className="text-sm text-gray-700 hover:text-black">
            Privacy
            </Link>
            <Link href="/signup">
              <Button 
                variant="outline"
                className="rounded-[15px] border-2 bg-white px-8 py-2 text-black hover:bg-gray-200"
                style={{ 
                  borderImage: 'linear-gradient(to right, #6E5099, #AD7EF1) 1'
                }}
              >
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                className="rounded-[15px] px-8 py-2 text-white hover:opacity-90"
                style={{ 
                  background: 'linear-gradient(to right, #6E5099, #AD7EF1)'
                }}
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

     
      <section
        className="relative h-[calc(100vh-4rem)] bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url(/images/landing_page.png)" }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80 dark:from-black/85 dark:via-black/80 dark:to-black/90" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative h-full mx-auto flex max-w-4xl flex-col items-center justify-center px-4 sm:px-6 text-center">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block text-white drop-shadow-lg">
                Turn Social Engagement Into
              </span>
              <span className="inline-block mt-2 bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
                Warm Leads
              </span>
              <span className="text-white drop-shadow-lg"> Instantly</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed opacity-90 px-4">
              Extract engaged users from social posts and enrich their profiles with public data in seconds
            </p>
            
            <div className="flex gap-2 sm:gap-4 justify-center pt-2 sm:pt-4 w-full px-4">
              {user ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="Paste LinkedIn post URL..."
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-700 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-lg"
                    />
                  </div>
                  <Button 
                    onClick={() => router.push('/input-url')}
                    className="group relative rounded-full bg-linear-to-r from-purple-500 to-purple-700 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white hover:from-purple-600 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap w-full sm:w-auto"
                  >
                    <span className="flex items-center gap-2 justify-center">
                      Extract
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </div>
              ) : (
                <Link href="/signup" className="w-full sm:w-auto max-w-xs">
                  <Button className="group relative rounded-full bg-linear-to-r from-purple-500 to-purple-700 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white hover:from-purple-600 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 w-full">
                    <span className="flex items-center gap-2 justify-center">
                      Start Free
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative bg-linear-to-b from-white to-purple-50/30 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 py-12 sm:py-16 lg:py-20 transition-colors overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              How It <span className="bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">Transform social engagement into qualified leads in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative group max-w-md lg:max-w-lg mx-auto">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <Image 
                  src="/images/leftlanding.jpg" 
                  alt="How it works illustration" 
                  width={600}
                  height={450}
                  className="relative w-full h-auto rounded-xl sm:rounded-2xl shadow-xl border border-purple-100 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Right - Steps */}
            <div className="order-1 lg:order-2 space-y-4 sm:space-y-5">
              {/* Step 1 */}
              <div className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-x-2">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">Paste Social URL</h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Drop a LinkedIn post URL to instantly target users who've shown interest in topics relevant to your brand
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-x-2">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">AI Enrichment</h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      We extract engaged users and enrich profiles with public data - education, experience, and contact info
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-x-2">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-gray-100 mb-2">Export & Convert</h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download a clean, CRM-ready lead list in CSV/XLSX format with zero manual cleanup required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative bg-white dark:bg-gray-900 px-4 sm:px-6 py-12 sm:py-16 transition-colors overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Use <span className="bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Cases</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">Perfect for every growth-focused professional</p>
          </div>

          {/* Cards Carousel */}
          <div className="relative mb-6 flex items-center justify-center px-4 min-h-[300px] sm:min-h-[340px]">
            <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap w-full">
              {useCaseCards.map((card, index) => {
                const isActive = index === activeCardIndex;
                const offset = (index - activeCardIndex) * 100;
                const translateX = offset < -180 ? offset + 300 : offset > 180 ? offset - 300 : offset;

                return (
                  <div
                    key={card.id}
                    className="group transition-all duration-1000 cursor-pointer transform shrink-0 perspective-1000"
                    style={{
                      transform: `translateX(${translateX * 0.9}px) ${isActive ? 'translateY(-8px)' : 'translateY(0px)'}`,
                      opacity: isActive ? 1 : 0.4,
                      scale: isActive ? 1.05 : 0.85,
                      zIndex: isActive ? 10 : 1,
                    }}
                    onClick={() => setActiveCardIndex(index)}
                  >
                    <div className={`relative w-56 sm:w-64 h-72 sm:h-80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ${isActive ? 'ring-4 ring-purple-400 dark:ring-purple-500' : ''} hover:shadow-purple-500/50`}>
                      {/* Background gradient overlay */}
                      <div className={`absolute inset-0 ${card.bgColor.includes('purple') ? 'bg-linear-to-br from-purple-400/90 to-purple-600/90 dark:from-purple-600/95 dark:to-purple-800/95' : card.bgColor.includes('pink') ? 'bg-linear-to-br from-pink-400/90 to-pink-600/90 dark:from-pink-600/95 dark:to-pink-800/95' : 'bg-linear-to-br from-blue-400/90 to-blue-600/90 dark:from-blue-600/95 dark:to-blue-800/95'}`} />
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 text-center">
                        {/* Icon/Image with glow */}
                        <div className="mb-4 relative">
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-150" />
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-500">
                            <Image
                              src={card.image}
                              alt={card.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Title with icon */}
                        <div className="mb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">{card.title}</h3>
                          <div className="w-12 h-1 bg-white/50 rounded-full mx-auto" />
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm text-white/95 leading-relaxed max-w-xs drop-shadow-md">{card.description}</p>
                        
                        {/* Decorative corner */}
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-2xl" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/30 rounded-bl-2xl" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicator Dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            {useCaseCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCardIndex(index)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === activeCardIndex
                    ? "w-8 h-3 bg-linear-to-r from-purple-600 to-purple-800 shadow-lg"
                    : "w-3 h-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                }`}
                aria-label={`Go to ${useCaseCards[index].title}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="relative bg-linear-to-b from-purple-50/30 to-white dark:from-gray-800 dark:to-gray-900 px-4 sm:px-6 py-12 sm:py-16 lg:py-20 transition-colors overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Compliance & <span className="bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Privacy</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">Your data security is our priority</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Main Points */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  We only process data that is unambiguously public on the source platform.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  We guarantee Zero Private Data Access and adhere to all platform Terms of Service.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  PII is stored securely and encrypted for list compilation purposes only.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  All PII records are automatically and permanently purged after 30 days.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  We respect Data Subject Rights. Contact <a href="mailto:compliance@yourcompanyname.com" className="text-purple-600 dark:text-purple-400 hover:underline">compliance@yourcompanyname.com</a> for export or deletion requests.
                </p>
              </div>
            </div>

            {/* Vertical Divider - Hidden on mobile */}
            <div className="hidden lg:block absolute left-1/2 top-24 bottom-24 w-px bg-linear-to-b from-transparent via-purple-300 dark:via-purple-700 to-transparent" />

            {/* Right Side - Summary */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-100 dark:border-gray-700">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ethical Sourcing</h3>
                      <div className="w-16 h-1 bg-linear-to-r from-purple-600 to-purple-800 rounded-full" />
                    </div>
                  </div>
                  <p className="text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                    We only use public data and strictly adhere to all platform Terms of Service to ensure ethical sourcing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linear-to-b from-purple-100 to-purple-50 dark:from-gray-900 dark:to-slate-950 px-4 sm:px-6 py-12 sm:py-16 border-t border-purple-200 dark:border-gray-800 transition-colors">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto transition-transform group-hover:scale-105">
                  <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="currentColor" className="text-slate-800 dark:text-slate-100"/>
                  <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#A960FF"/>
                  <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#8300DD"/>
                  <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#4B0082"/>
                </svg>
                <div>
                  <div className="text-sm font-bold leading-tight bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Warm leads</div>
                  <div className="text-sm font-bold leading-tight bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Sourcer</div>
                </div>
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Turn social engagement into warm leads instantly with AI-powered data enrichment.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">How it Works</Link></li>
                <li><Link href="#use-cases" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Use Cases</Link></li>
                <li><Link href="/signup" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About Us</Link></li>
                <li><Link href="#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="mailto:contact@warmleadsourcer.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@warmleadsourcer.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">support@warmleadsourcer.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-slate-600 dark:text-slate-400">San Francisco, CA 94102</span>
                </li>
              </ul>
              
              {/* Social Links */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-purple-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                © {new Date().getFullYear()} Warm Lead Sourcer. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</Link>
                <Link href="#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms</Link>
                <Link href="#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
