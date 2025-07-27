import { useState, useEffect } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import JobsTabs from "../components/jobs-tabs"
import JobsFilters from "../components/jobs-filters"
import JobsEmptyState from "../components/jobs-empty-state"
import JobsPagination from "../components/jobs-pagination"
import JobDetailsModal from "../components/job-details-modal"
import { Plus, AlertCircle, Loader2, Eye, Calendar, Clock, MapPin, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { jobsAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ZenbookerJobs = () => {
  const { user, loading: authLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedJob, setSelectedJob] = useState(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const navigate = useNavigate()
  
  // API State
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
    teamMember: "",
    customer: "",
    search: "",
    invoiceStatus: "",
    sortBy: "scheduled_date",
    sortOrder: "ASC"
  })

  // Debounced search to prevent too many API calls
  useEffect(() => {
    if (!authLoading && user?.id) {
      const timeoutId = setTimeout(() => {
        fetchJobs()
      }, 300) // 300ms delay

      return () => clearTimeout(timeoutId)
    } else if (!authLoading && !user?.id) {
      // If auth is done loading but no user, redirect to signin
      navigate('/signin')
    }
  }, [activeTab, filters, user?.id, authLoading])

  const fetchJobs = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      // Map tab to status filter and date logic
      let statusFilter = ""
      let dateFilter = ""
      
      switch (activeTab) {
        case "upcoming":
          statusFilter = "pending,confirmed,in_progress"
          dateFilter = "future" // Jobs scheduled for today and future
          break
        case "past":
          statusFilter = "completed,cancelled"
          dateFilter = "past" // Jobs from yesterday and earlier
          break
        case "complete":
          statusFilter = "completed"
          break
        case "incomplete":
          statusFilter = "pending,confirmed,in_progress"
          break
        case "canceled":
          statusFilter = "cancelled"
          break
        case "daterange":
          // Date range will be handled by filters.dateRange
          statusFilter = ""
          break
        case "all":
        default:
          statusFilter = ""
          break
      }
      
      // Build query parameters for the API call
      const queryParams = new URLSearchParams({
        userId: user.id
      })
      
      if (statusFilter) {
        queryParams.append('status', statusFilter)
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search)
      }
      
      if (dateFilter) {
        queryParams.append('dateFilter', dateFilter)
      }
      
      if (filters.dateRange) {
        queryParams.append('dateRange', filters.dateRange)
      }
      
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy)
      }
      
      if (filters.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder)
      }
      
      queryParams.append('page', '1')
      queryParams.append('limit', '50')
      
      const response = await jobsAPI.getAll(
        user.id, 
        statusFilter, 
        filters.search, 
        1, // page
        50, // limit
        dateFilter,
        filters.dateRange,
        filters.sortBy,
        filters.sortOrder,
        filters.teamMember,
        filters.invoiceStatus
      )
      setJobs(response.jobs || response) // Handle both new and old response format
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

  const handleJobUpdate = async () => {
    // Refresh jobs list
    fetchJobs()
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setIsJobModalOpen(true)
  }

  const handleViewCustomer = (customerId) => {
    navigate(`/customer/${customerId}`)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleRetry = () => {
    fetchJobs()
  }

  const getJobCount = (status) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      switch (status) {
        case "upcoming":
          return ["pending", "confirmed", "in_progress"].includes(job.status) && jobDate >= today
        case "past":
          return ["completed", "cancelled"].includes(job.status) && jobDate < today
        case "complete":
          return job.status === "completed"
        case "incomplete":
          return ["pending", "confirmed", "in_progress"].includes(job.status)
        case "canceled":
          return job.status === "cancelled"
        case "daterange":
          // For date range, we'll show all jobs and let the date filter handle it
          return true
        case "all":
        default:
          return true
      }
    }).length
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
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
        <JobsFilters filters={filters} onFilterChange={handleFilterChange} activeTab={activeTab} />

        {/* Jobs List */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <JobsEmptyState onCreateJob={handleCreateJob} />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'in_progress' ? 'bg-blue-500' :
                            job.status === 'cancelled' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <h3 className="font-medium text-gray-900 text-lg">
                            {job.service_name || 'Service'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <button
                              onClick={() => handleViewCustomer(job.customer_id)}
                              className="hover:text-primary-600 hover:underline cursor-pointer transition-colors duration-200"
                            >
                              {job.customer_first_name} {job.customer_last_name}
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(job.scheduled_date)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(job.scheduled_date)}</span>
                          </div>
                          
                          {job.team_member_first_name && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {job.team_member_first_name} {job.team_member_last_name}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {job.notes && (
                          <p className="text-sm text-gray-600 mb-4">
                            {job.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewJob(job)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Job Details Modal */}
      {isJobModalOpen && selectedJob && (
        <JobDetailsModal
          isOpen={isJobModalOpen}
          onClose={() => {
            setIsJobModalOpen(false)
            setSelectedJob(null)
          }}
          job={selectedJob}
          onJobUpdate={handleJobUpdate}
        />
      )}
    </div>
  )
}

export default ZenbookerJobs
