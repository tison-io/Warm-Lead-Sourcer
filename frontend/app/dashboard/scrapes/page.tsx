"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useSidebar } from "@/contexts/SidebarContext"
import toast from "react-hot-toast"
import { Loading } from "@/components/ui/loading"

interface Post {
  _id: string
  url: string
  status: string
  processedEngagements?: number
  createdAt: string
}

export default function ScrapesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 5
  const { setIsOpen } = useSidebar()

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  const fetchPosts = async (page: number) => {
    setLoading(true)
    try {
      const allData = await api.get('/posts')
      const allPosts = Array.isArray(allData) ? allData : allData.posts || []
      
      // Client-side pagination
      const startIndex = (page - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage
      const paginatedPosts = allPosts.slice(startIndex, endIndex)
      
      setPosts(paginatedPosts)
      setTotalPages(Math.ceil(allPosts.length / postsPerPage))
      setTotalPosts(allPosts.length)
    } catch {
      toast.error('Failed to load scrapes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading text="Loading scrapes" size="md" />
      </div>
    )
  }

  return (
    <>
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">My Scrapes</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 hidden sm:block">View all your previous LinkedIn post scrapes</p>
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

          <main className="p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">
            {posts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No scrapes yet</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Start by scraping your first LinkedIn post</p>
                <Link 
                  href="/input-url"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                >
                  Start Scraping
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Post URL</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="hidden sm:table-cell px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Leads</th>
                        <th className="hidden md:table-cell px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {posts.map((post: Post) => (
                        <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                            <div className="text-xs text-gray-900 dark:text-white max-w-[100px] sm:max-w-[200px] lg:max-w-[300px] truncate" title={post.url}>
                              {post.url}
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {post.processedEngagements || 0} leads • {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs text-gray-900 dark:text-gray-300">
                            {post.processedEngagements || 0}
                          </td>
                          <td className="hidden md:table-cell px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs">
                            {post.status === 'completed' ? (
                              <Link 
                                href={`/dashboard/results?postId=${post._id}`}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-medium"
                              >
                                <span className="hidden sm:inline">View Results</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6 px-3 sm:px-6">
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                  Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} scrapes
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    let page;
                    if (totalPages <= 3) {
                      page = i + 1;
                    } else if (currentPage <= 2) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      page = totalPages - 2 + i;
                    } else {
                      page = currentPage - 1 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                </div>
              </div>
            )}
          </main>
    </>
  )
}