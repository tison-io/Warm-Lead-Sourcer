"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/dashboard/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useSidebar } from "@/contexts/SidebarContext"

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
}

interface Post {
  _id: string
  url: string
  totalEngagements?: number
}

function ResultsPageContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const { isOpen } = useSidebar()

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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/leads/export?postId=${postId}&format=${format}`, {
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
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!postId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-60' : 'ml-16'} flex items-center justify-center`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results to Display</h2>
              <p className="text-gray-600 mb-6">Please process a post first to see results.</p>
              <Link href="/input-url" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                Start New Scrape
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-60' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 pl-16 lg:pl-6 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Scraping Results</h1>
              <p className="text-sm lg:text-base text-gray-600">
                Results from <span className="text-purple-600 font-medium">{post?.url || 'LinkedIn post'}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button 
                onClick={() => handleExport('csv')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg transition-colors"
              >
                Export CSV
              </button>
              <Link 
                href="/input-url"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg transition-colors"
              >
                New Scrape
              </Link>
            </div>
          </div>
        </header>

        {/* Results Content */}
        <main className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Engagements</p>
                  <p className="text-3xl font-bold">{post?.totalEngagements || 0}</p>
                </div>
                <svg className="w-12 h-12 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Filtered Hits</p>
                  <p className="text-3xl font-bold">{leads.length}</p>
                </div>
                <svg className="w-12 h-12 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Processing Time</p>
                  <p className="text-3xl font-bold">1m 34s</p>
                </div>
                <svg className="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lead Results</h3>
            </div>
            
            <div className="overflow-x-auto -mx-4 lg:mx-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LinkedIn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead: Lead, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">
                              {lead.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          View Profile
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-48">
                        <div className="truncate">
                          {lead.headline || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.education?.[0]?.institution || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.guessedEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-lg p-4 lg:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">
                    {selectedLead.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                  <p className="text-gray-600">{selectedLead.headline || 'No headline'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">LinkedIn:</span> 
                      <a href={selectedLead.profileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">
                        View Profile
                      </a>
                    </p>
                    <p><span className="font-medium">Guessed Email:</span> {selectedLead.guessedEmail || 'N/A'}</p>
                    <p><span className="font-medium">Location:</span> {selectedLead.location?.city || selectedLead.location?.country || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lead Score</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedLead.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                      selectedLead.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedLead.matchScore}/100
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                {selectedLead.education && selectedLead.education.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.education.map((edu, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-gray-500">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education information available</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                {selectedLead.experience && selectedLead.experience.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.experience.map((exp, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        {(exp.startYear || exp.endYear) && (
                          <p className="text-xs text-gray-500">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No experience information available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  )
}