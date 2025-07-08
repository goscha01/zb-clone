import { useState, useEffect } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import JobsTabs from "../components/jobs-tabs"
import JobsFilters from "../components/jobs-filters"
import JobsEmptyState from "../components/jobs-empty-state"
import JobsPagination from "../components/jobs-pagination"
import { Plus, AlertCircle, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { jobsAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ZenbookerJobs = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const navigate = useNavigate()
  
  // API State
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
    teamMember: "",
    customer: ""
  })

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs()
  }, [activeTab, filters])

  const fetchJobs = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      // Map tab to status filter
      let statusFilter = ""
      switch (activeTab) {
        case "upcoming":
          statusFilter = "pending,confirmed"
          break
        case "in-progress":
          statusFilter = "in_progress"
          break
        case "completed":
          statusFilter = "completed"
          break
        case "cancelled":
          statusFilter = "cancelled"
          break
        default:
          statusFilter = ""
      }
      
      const response = await jobsAPI.getAll(user.id, statusFilter)
      setJobs(response)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError("Failed to load jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = () => {
    navigate("/createjob")
  }

  const handleJobUpdate = async (jobId, updateData) => {
    try {
      setError("")
      await jobsAPI.update(jobId, updateData)
      
      // Refresh jobs list
      fetchJobs()
    } catch (error) {
      console.error('Error updating job:', error)
      
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 404:
            setError("Job not found.")
            break
          case 500:
            setError("Server error. Please try again later.")
            break
          default:
            setError(data?.error || "Failed to update job. Please try again.")
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.")
      } else {
        setError("An unexpected error occurred.")
      }
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleRetry = () => {
    fetchJobs()
  }

  const getJobCount = (status) => {
    return jobs.filter(job => {
      switch (status) {
        case "upcoming":
          return ["pending", "confirmed"].includes(job.status)
        case "in-progress":
          return job.status === "in_progress"
        case "completed":
          return job.status === "completed"
        case "cancelled":
          return job.status === "cancelled"
        default:
          return true
      }
    }).length
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-5 items-center justify-between shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <h1 className="text-2xl font-display font-semibold text-gray-900">Jobs</h1>
            <button 
              onClick={handleCreateJob}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-semibold text-gray-900">Jobs</h1>
            <button 
              onClick={handleCreateJob}
              className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <JobsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              counts={{
                upcoming: getJobCount("upcoming"),
                "in-progress": getJobCount("in-progress"),
                completed: getJobCount("completed"),
                cancelled: getJobCount("cancelled")
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <JobsFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="max-w-7xl mx-auto w-full p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <JobsEmptyState activeTab={activeTab} />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          job.status === 'completed' ? 'bg-green-500' :
                          job.status === 'in_progress' ? 'bg-blue-500' :
                          job.status === 'cancelled' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {job.service_name || 'Service'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {job.customer_name || 'Customer'} • {job.scheduled_date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && <JobsPagination />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerJobs
