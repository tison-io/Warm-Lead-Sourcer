"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/dashboard/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useSidebar } from "@/contexts/SidebarContext"

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
  const { isOpen } = useSidebar()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await api.get('/posts')
      setPosts(data)
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
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />

        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-60' : 'ml-16'}`}>
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pl-16 lg:pl-6 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Scrapes</h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">View all your previous LinkedIn post scrapes</p>
              </div>
              <Link 
                href="/input-url"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg w-fit"
              >
                New Scrape
              </Link>
            </div>
          </header>

          <main className="p-4 lg:p-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scrapes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start by scraping your first LinkedIn post</p>
                <Link 
                  href="/input-url"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                >
                  Start Scraping
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto -mx-4 lg:mx-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Post URL</th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Leads</th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {posts.map((post: Post) => (
                        <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 lg:px-6 py-3 lg:py-4">
                            <div className="text-xs lg:text-sm text-gray-900 dark:text-white max-w-32 lg:max-w-64 truncate">
                              {post.url}
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 dark:text-gray-300">
                            {post.processedEngagements || 0}
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                            {post.status === 'completed' ? (
                              <Link 
                                href={`/dashboard/results?postId=${post._id}`}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              >
                                View Results
                              </Link>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">No results</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}