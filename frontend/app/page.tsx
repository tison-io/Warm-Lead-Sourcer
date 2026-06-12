'use client';

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function LandingPage() {
  const { user } = useAuth();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
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

  const steps = [
    "Validating post",
    "Reading interactions", 
    "Collecting profiles",
    "Enriching data",
    "Scoring leads",
    "Finalizing results",
  ];

  const handleExtract = async () => {
    if (!linkedinUrl.trim()) {
      toast.error('Please enter a LinkedIn post URL');
      return;
    }

    // Simple URL validation
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(linkedinUrl)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsExtracting(true);
    setExtractionStep(0);

    try {
      // Create post entry (processing starts automatically)
      const postResponse = await api.post('/posts', {
        url: linkedinUrl
      });
      
      const postId = postResponse._id;
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setExtractionStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);

      // Poll for completion
      const checkStatus = async () => {
        try {
          const response = await api.get(`/posts/${postId}`);
          
          if (response.status === 'completed') {
            clearInterval(progressInterval);
            setExtractionStep(steps.length - 1);
            toast.success('Processing completed! Redirecting to results...');
            setTimeout(() => {
              router.push(`/dashboard/results?postId=${postId}`);
            }, 1000);
            return true;
          }
          
          if (response.status === 'failed') {
            clearInterval(progressInterval);
            const errorMsg = response.errorMessage || 'Processing failed. Please try again.';
            toast.error(errorMsg);
            setIsExtracting(false);
            return true;
          }
          
          return false;
        } catch (err) {
          console.error('Failed to check status:', err);
          return false;
        }
      };

      // Check status every 3 seconds
      const statusInterval = setInterval(async () => {
        const completed = await checkStatus();
        if (completed) {
          clearInterval(statusInterval);
        }
      }, 3000);

      // Initial check
      await checkStatus();
      
    } catch (err) {
      console.error('Failed to start extraction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start extraction';
      toast.error(errorMessage);
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % useCaseCards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [useCaseCards.length]);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      

     
      <section
        className="relative min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url(/images/landing_page.png)" }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80 dark:from-black/85 dark:via-black/80 dark:to-black/90" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative h-full mx-auto flex max-w-4xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="block text-white drop-shadow-lg">
                Turn Social Engagement Into
              </span>
              <span className="inline-block mt-2 bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
                Warm Leads
              </span>
              <span className="text-white drop-shadow-lg"> Instantly</span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed opacity-90 px-2 sm:px-4">
              Extract engaged users from social posts and enrich their profiles with public data in seconds.
            </p>
            
            <div className="flex gap-2 sm:gap-4 justify-center pt-2 sm:pt-4 w-full px-2 sm:px-4">
              {user ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="Paste LinkedIn post URL..."
                      className="w-full px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-700 text-xs sm:text-sm lg:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-lg"
                    />
                  </div>
                  <Button 
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="group relative rounded-full bg-linear-to-r from-purple-500 to-purple-700 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white hover:from-purple-600 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap w-full sm:w-auto disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center gap-2 justify-center">
                      {isExtracting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {steps[extractionStep]}
                        </>
                      ) : (
                        <>
                          Extract
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
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
                      Download a clean, CRM ready lead list in CSV/XLSX format with zero manual cleanup required
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

      <Footer />
    </div>
  )
}
