import { useState, useEffect, useMemo } from "react"
import { Plus, ChevronLeft, ChevronRight, Calendar, Grid3X3, MapPin, Clock, DollarSign, User, Filter, AlertTriangle, RefreshCw } from "lucide-react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { useNavigate } from "react-router-dom"

import EditJobModal from "../components/edit-job-modal"
import { useAuth } from "../context/AuthContext"
import { jobsAPI } from "../services/api"

const ZenbookerSchedule = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentView, setCurrentView] = useState("day") // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date()) // Current date
  const [jobs, setJobs] = useState([])

  const [showEditJob, setShowEditJob] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Get current user with useMemo to prevent infinite re-renders
  const currentUser = useMemo(() => user, [user])

  useEffect(() => {
    if (currentUser?.id) {
      loadJobs()
    } else if (!currentUser) {
      console.log('❌ No authenticated user, redirecting to signin')
      navigate('/signin')
    }
  }, [currentUser, currentView, currentDate, navigate])

  const loadJobs = async () => {
    if (!currentUser?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      console.log('🔄 Loading jobs for user:', currentUser.id)
      
      // Calculate date range based on current view
      let startDate, endDate
      if (currentView === 'day') {
        // For day view, get jobs for the specific day
        startDate = new Date(currentDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
      } else if (currentView === 'week') {
        startDate = new Date(currentDate)
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
      }
      
      console.log('📅 Date range:', { startDate, endDate, currentView })
      
      const response = await jobsAPI.getAll(currentUser.id, "", "", 1, 1000, "future", "", "scheduled_date", "ASC")
      
      // Filter jobs by date range
      const filteredJobs = (response.jobs || response || []).filter(job => {
        const jobDate = new Date(job.scheduled_date)
        console.log('🔍 Checking job:', job.id, jobDate, 'against range:', startDate, 'to', endDate)
        return jobDate >= startDate && jobDate <= endDate
      })
      
      console.log('✅ Jobs loaded:', filteredJobs.length, 'for', currentView, 'view')
      setJobs(filteredJobs)
    } catch (error) {
      console.error('❌ Error loading jobs:', error)
      if (error.response?.status === 403) {
        setError("Authentication required. Please log in again.")
        navigate('/signin')
      } else {
        setError("Failed to load jobs. Please try again.")
      }
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date, view) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    
    if (view === 'day') {
      return date.toLocaleDateString('en-US', options)
    } else if (view === 'week') {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    
    if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + direction)
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7))
    } else {
      newDate.setMonth(currentDate.getMonth() + direction)
    }
    
    setCurrentDate(newDate)
  }

  const handleCreateJob = () => {
    navigate('/create-job')
  }

  const handleViewJob = (job) => {
    navigate(`/job/${job.id}`)
  }

  const handleViewCustomer = (customerId) => {
    navigate(`/customer/${customerId}`)
  }

  const handleEditJob = (job) => {
    setSelectedJob(job)
    setShowEditJob(true)
  }

  const handleSaveJob = (updatedJob) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
    setShowEditJob(false)
    setSelectedJob(null)
  }

  const handleCloseModals = () => {
    setShowEditJob(false)
  }

  // Day View Component
  const DayView = () => (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
              <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading jobs...</h3>
              <p className="text-gray-500 mb-6">Please wait while we fetch the scheduled jobs.</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error: {error}</h3>
              <p className="text-gray-500 mb-6">Failed to load jobs. Please try again later.</p>
              <button 
                onClick={loadJobs}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'completed': return 'bg-green-100 text-green-800 border-green-200';
                  case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
                  case 'confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
                  default: return 'bg-gray-100 text-gray-800 border-gray-200';
                }
              };
              
              return (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {job.team_member_first_name?.charAt(0) || job.service_name?.charAt(0) || 'J'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {job.service_name || 'Service'}
                          </h3>
                          <button
                            onClick={() => handleViewCustomer(job.customer_id)}
                            className="text-sm text-gray-600 hover:text-blue-600 hover:underline cursor-pointer transition-colors duration-200 truncate block"
                          >
                            {job.customer_first_name} {job.customer_last_name}
                          </button>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)} flex-shrink-0`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.team_member_first_name} {job.team_member_last_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 sm:col-span-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.customer_address || 'Address not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-green-600">${job.service_price || '0'}</span>
                        </div>
                      </div>
                      
                      {job.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 italic">"{job.notes}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:ml-4">
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewJob(job)}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled jobs</h3>
              <p className="text-gray-500 mb-6">No jobs scheduled for {formatDate(currentDate, 'day')}</p>
              <button 
                onClick={handleCreateJob}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Week View Component
  const WeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }

    const getJobsForDay = (date) => {
      return jobs.filter(job => {
        const jobDate = new Date(job.scheduled_date)
        return jobDate.toDateString() === date.toDateString()
      })
    }

    return (
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayJobs = getJobsForDay(day)
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className={`bg-white rounded-lg border ${isToday ? 'border-blue-300 shadow-md' : 'border-gray-200'} p-4`}>
                  <div className="text-center mb-3">
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayJobs.map(job => (
                      <div key={job.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium truncate">{job.service_name}</div>
                        <div className="text-gray-600 truncate">
                          {job.customer_first_name} {job.customer_last_name}
                        </div>
                        <div className="text-gray-500">
                          {new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Month View Component
  const MonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const isToday = (date) => date.toDateString() === new Date().toDateString()
    const isCurrentMonth = (date) => date.getMonth() === month
    
    const generateDaysArray = () => {
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(firstDay.getDate() - firstDay.getDay())
      
      const days = []
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        days.push(date)
      }
      return days
    }

    const getJobsForDay = (date) => {
      return jobs.filter(job => {
        const jobDate = new Date(job.scheduled_date)
        return jobDate.toDateString() === date.toDateString()
      })
    }

    const days = generateDaysArray()

    return (
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{day}</div>
                </div>
              ))}
              
              {days.map((date, index) => {
                const dayJobs = getJobsForDay(date)
                const isCurrentMonthDay = isCurrentMonth(date)
                const isTodayDate = isToday(date)
                
                return (
                  <div key={index} className={`bg-white min-h-[100px] p-2 ${!isCurrentMonthDay ? 'bg-gray-50' : ''}`}>
                    <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayJobs.slice(0, 3).map(job => (
                        <div key={job.id} className="p-1 bg-blue-50 rounded text-xs truncate">
                          <div className="font-medium truncate">{job.service_name}</div>
                          <div className="text-gray-600 truncate">
                            {job.customer_first_name} {job.customer_last_name}
                          </div>
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayJobs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case "day":
        return <DayView />
      case "week":
        return <WeekView />
      case "month":
        return <MonthView />
      default:
        return <DayView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 bg-white">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCreateJob}
                    className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Schedule</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    <span className="font-medium text-sm sm:text-base">{formatDate(currentDate, currentView)}</span>
                    
                    <button
                      onClick={() => navigateDate(1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setCurrentView("day")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        currentView === "day" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setCurrentView("week")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        currentView === "week" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setCurrentView("month")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        currentView === "month" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {renderView()}
        </div>
      </div>

      {/* Modals */}
      
      <EditJobModal 
        isOpen={showEditJob}
        onClose={handleCloseModals}
        job={selectedJob}
        onSave={handleSaveJob}
      />
    </div>
  )
}

export default ZenbookerSchedule