"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { useSidebar } from "@/contexts/SidebarContext"
import toast from "react-hot-toast"
import { Loading } from "@/components/ui/loading"

interface Lead {
  _id: string
  name: string
  headline?: string
  profileUrl: string
  education?: Array<{ institution: string; degree?: string; fieldOfStudy?: string; startYear?: number; endYear?: number }>
  experience?: Array<{ company: string; title: string; startYear?: number; endYear?: number }>
  guessedEmail?: string
  matchScore: number
  location?: { city?: string; country?: string }
  engagementType?: string
  engagementText?: string
}

interface Post {
  _id: string
  url: string
  totalEngagements?: number
  createdAt?: string
  processedAt?: string
  processingTime?: number
}

function ResultsPageContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const { setIsOpen } = useSidebar()


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, leadsData] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/leads?postId=${postId}`)
        ])
        setPost(postData)
        setLeads(Array.isArray(leadsData) ? leadsData : [])
        console.log('Post data:', postData)
        console.log('Leads data:', leadsData)
        console.log('Sample lead with all fields:', leadsData[0])
      } catch (error) {
        console.error('Error loading results:', error)
        toast.error('Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      void fetchData()
    } else {
      setLoading(false)
    }
  }, [postId])



  const handleExport = async (format: string) => {
    const toastId = toast.loading('Starting download...')
    
    try {
      toast.loading('Preparing export data...', { id: toastId })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-2.onrender.com'}/leads/export?postId=${postId}&format=${format}`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      toast.loading('Processing file...', { id: toastId })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      
      toast.loading('Download starting...', { id: toastId })
      
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Show success after a short delay
      setTimeout(() => {
        toast.success('Download completed successfully!', { id: toastId })
      }, 500)
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading text="Loading results" size="md" />
      </div>
    )
  }

  if (!postId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results to Display</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please process a post first to see results.</p>
          <Link href="/input-url" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            Start New Scrape
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">Scraping Results</h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                  Results from <span className="text-purple-600 dark:text-purple-400 font-semibold">{post?.url?.substring(0, 30) || 'LinkedIn post'}...</span>
                </p>
              </div>
            </div>
            <Link 
              href="/input-url"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl w-fit text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span className="hidden sm:inline">New Scrape</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </header>

        {/* Results Content */}
        <main className="p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                  <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Engagements</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{post?.totalEngagements || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quality Leads</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl">
                  <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M17 13H11V7H12.5V11.5H17V13Z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Processing Time</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {post?.processingTime ? 
                      `${Math.floor(post.processingTime / 60)}m ${post.processingTime % 60}s` : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleExport('csv')}
              className="group bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-6 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z M12,19L8,15L9.41,13.58L11,15.17V10H13V15.17L14.59,13.58L16,15L12,19Z"/>
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Export Data</p>
                  <p className="text-2xl font-bold text-white">Download CSV</p>
                </div>
              </div>
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden w-full">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Lead Results ({leads.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Name</th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">LinkedIn</th>
                    <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Role</th>
                    <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">University</th>
                    <th className="hidden xl:table-cell px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email</th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Score</th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leads.map((lead: Lead, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 min-w-0">
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {lead.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{lead.name}</div>
                            <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                              {lead.headline || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                        {lead.profileUrl && lead.profileUrl.trim() ? (
                          <a 
                            href={lead.profileUrl.includes('linkedin.com') ? lead.profileUrl : `https://linkedin.com/in/${lead.profileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline text-xs font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs text-gray-900 dark:text-gray-300">
                        <div className="truncate max-w-[100px] lg:max-w-[150px]" title={lead.headline || 'N/A'}>
                          {lead.headline || 'N/A'}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs text-gray-900 dark:text-gray-300">
                        <div className="truncate max-w-[120px]" title={lead.education?.[0]?.institution || 'N/A'}>
                          {lead.education?.[0]?.institution || 'N/A'}
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs text-gray-900 dark:text-gray-300">
                        <div className="truncate max-w-[140px]">{lead.guessedEmail || 'N/A'}</div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          lead.matchScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          lead.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {lead.matchScore}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="inline-flex items-center justify-center w-7 h-7 text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600 dark:hover:bg-purple-500 rounded-lg transition-all duration-200 flex-shrink-0"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


        </main>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 max-w-xs sm:max-w-lg lg:max-w-2xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Lead Details</h2>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-300 font-bold text-sm sm:text-xl">
                    {selectedLead.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold dark:text-white truncate">{selectedLead.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{selectedLead.headline || 'No headline'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Contact Information</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p className="dark:text-gray-300 break-words"><span className="font-medium">LinkedIn:</span> 
                      {selectedLead.profileUrl && selectedLead.profileUrl.trim() ? (
                        <a 
                          href={selectedLead.profileUrl.includes('linkedin.com') ? selectedLead.profileUrl : `https://linkedin.com/in/${selectedLead.profileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-purple-600 dark:text-purple-400 hover:underline ml-1 break-all"
                        >
                          View Profile
                        </a>
                      ) : (
                        <span className="text-gray-400 ml-1">N/A</span>
                      )}
                    </p>
                    <p className="dark:text-gray-300 break-words"><span className="font-medium">Email:</span> {selectedLead.guessedEmail || 'N/A'}</p>
                    <p className="dark:text-gray-300"><span className="font-medium">Location:</span> {selectedLead.location?.city || selectedLead.location?.country || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Lead Score</h4>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                      selectedLead.matchScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedLead.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedLead.matchScore}/100
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Education</h4>
                {selectedLead.education && selectedLead.education.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.education.map((edu, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded">
                        <p className="font-medium dark:text-white text-xs sm:text-sm truncate">{edu.institution}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No education information available</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Experience</h4>
                {selectedLead.experience && selectedLead.experience.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.experience.map((exp, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded">
                        <p className="font-medium dark:text-white text-xs sm:text-sm truncate">{exp.title}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{exp.company}</p>
                        {(exp.startYear || exp.endYear) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No experience information available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <Loading text="Loading page" size="md" />
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  )
}