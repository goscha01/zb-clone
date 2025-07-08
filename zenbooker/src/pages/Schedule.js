import { useState } from "react"
import { Plus, ChevronLeft, ChevronRight, Calendar, Grid3X3, MapPin, Clock, DollarSign, User, Filter } from "lucide-react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { useNavigate } from "react-router-dom"
import JobDetailsModal from "../components/job-details-modal"
import EditJobModal from "../components/edit-job-modal"

// Mock data for demonstration
const mockJobs = [
  {
    id: 1,
    title: "Kitchen Renovation",
    client: "John Smith",
    time: "09:00 - 12:00",
    duration: "3h",
    earnings: "$450",
    location: "123 Main St, Newark",
    status: "confirmed",
    type: "plumbing"
  },
  {
    id: 2,
    title: "Bathroom Repair",
    client: "Sarah Johnson",
    time: "14:00 - 16:30",
    duration: "2.5h",
    earnings: "$320",
    location: "456 Oak Ave, Hoboken",
    status: "pending",
    type: "repair"
  }
]

const ZenbookerSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [scheduleSidebarOpen, setScheduleSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("day") // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 26)) // June 26, 2025
  const [jobs, setJobs] = useState(mockJobs)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [showEditJob, setShowEditJob] = useState(false)
  const navigate = useNavigate()

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
    navigate("/createjob")
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setShowJobDetails(true)
  }

  const handleEditJob = (job) => {
    setSelectedJob(job)
    setShowEditJob(true)
  }

  const handleSaveJob = (updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    )
    setShowEditJob(false)
    setSelectedJob(null)
  }

  const handleCloseModals = () => {
    setShowJobDetails(false)
    setShowEditJob(false)
    setSelectedJob(null)
  }

  // Sidebar Component
  const ScheduleSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">JOBS ASSIGNED TO</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setActiveFilter("all")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeFilter === "all" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">All Jobs</span>
            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">12</span>
          </button>
          <button 
            onClick={() => setActiveFilter("unassigned")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeFilter === "unassigned" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Unassigned</span>
            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">3</span>
          </button>
          <button 
            onClick={() => setActiveFilter("justweb")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeFilter === "justweb" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="w-4 h-4 bg-primary-500 rounded text-white text-xs flex items-center justify-center font-bold">JW</div>
            <span className="text-sm font-medium">Just web</span>
            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">9</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {currentView === 'day' ? jobs.length : currentView === 'week' ? '12' : '45'}
          </div>
          <div className="text-sm text-gray-500">jobs</div>
          <div className="text-xs text-gray-400 mt-1">On the schedule</div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {currentView === 'day' ? '5h 30m' : currentView === 'week' ? '32h 15m' : '128h 45m'}
            </div>
            <div className="text-xs text-gray-400">Est. duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {currentView === 'day' ? '$770' : currentView === 'week' ? '$4,200' : '$18,500'}
            </div>
            <div className="text-xs text-gray-400">Est. earnings</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Day View Component
  const DayView = () => (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{job.client}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{job.time} ({job.duration})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-green-600">{job.earnings}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleViewJob(job)}
                      className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-display font-medium text-gray-900 mb-2">No scheduled jobs</h3>
              <p className="text-gray-500 mb-6">No jobs scheduled for {formatDate(currentDate, 'day')}</p>
              <button 
                onClick={handleCreateJob}
                className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    return (
      <div className="flex-1 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, index) => {
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(startOfWeek.getDate() + index)
            const isToday = dayDate.toDateString() === new Date().toDateString()
            
            return (
              <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-xs font-medium text-gray-500 mb-1">{day}</div>
                <div className={`text-lg font-display font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                  {dayDate.getDate()}
                </div>
                {isToday && <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>}
              </div>
            )
          })}
        </div>
        
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((day, index) => (
            <div key={`${day}-content`} className="border-r border-gray-200 last:border-r-0 min-h-96 p-2">
              {index === 4 && ( // Thursday
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-primary-50 border border-primary-200 rounded-lg p-2 text-xs hover:bg-primary-100 transition-colors cursor-pointer"
                      onClick={() => handleViewJob(job)}
                    >
                      <div className="font-medium text-primary-900">{job.time}</div>
                      <div className="text-primary-700">{job.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Month View Component
  const MonthView = () => {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    
    const isToday = (date) => date.toDateString() === new Date().toDateString()
    const isCurrentMonth = (date) => date.getMonth() === month
    
    const generateDaysArray = () => {
      const daysArray = []
      
      // Add days from previous month
      const prevMonth = new Date(year, month - 1)
      const daysInPrevMonth = new Date(year, month, 0).getDate()
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        daysArray.push({
          date: new Date(year, month - 1, daysInPrevMonth - i),
          isCurrentMonth: false
        })
      }
      
      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        })
      }
      
      // Add days from next month
      const remainingDays = 42 - daysArray.length // 6 rows * 7 days = 42
      for (let i = 1; i <= remainingDays; i++) {
        daysArray.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        })
      }
      
      return daysArray
    }

    return (
      <div className="flex-1 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
              <div className="text-xs font-medium text-gray-500">{day}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {generateDaysArray().map(({ date, isCurrentMonth }, index) => {
            const dayHasJobs = jobs.some(job => new Date(job.date)?.toDateString() === date.toDateString())
            const _isToday = isToday(date)
            
            return (
              <div
                key={index}
                className={`min-h-[120px] bg-white p-2 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    !isCurrentMonth ? 'text-gray-400' :
                    _isToday ? 'text-primary-600' :
                    'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </span>
                  {_isToday && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  )}
                </div>
                
                {dayHasJobs && (
                  <div className="space-y-1">
                    {jobs
                      .filter(job => new Date(job.date)?.toDateString() === date.toDateString())
                      .map((job) => (
                        <div
                          key={job.id}
                          className="bg-primary-50 border border-primary-200 rounded p-1 text-xs cursor-pointer hover:bg-primary-100 transition-colors"
                          onClick={() => handleViewJob(job)}
                        >
                          <div className="font-medium text-primary-900 truncate">{job.title}</div>
                          <div className="text-primary-600">{job.time}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
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
    <div className="flex h-screen bg-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <MobileHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 flex">
          <ScheduleSidebar />
          
          <div className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 bg-white">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleCreateJob}
                      className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-display font-semibold text-gray-900">Schedule</h1>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateDate(-1)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      <span className="font-medium">{formatDate(currentDate, currentView)}</span>
                      
                      <button
                        onClick={() => navigateDate(1)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentView("day")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          currentView === "day" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setCurrentView("week")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          currentView === "week" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setCurrentView("month")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
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
      </div>

      {/* Modals */}
      <JobDetailsModal 
        isOpen={showJobDetails}
        onClose={handleCloseModals}
        job={selectedJob}
      />
      
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