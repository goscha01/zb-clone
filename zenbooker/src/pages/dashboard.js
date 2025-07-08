"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import CustomerModal from "../components/customer-modal"
import { Plus, ChevronDown, Info, Star, Calendar, ArrowRight, BarChart2, CreditCard, Users, RefreshCw, MapPin, Globe, Check, AlertTriangle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const ZenbookerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState('7') // days
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const newMenuRef = useRef(null)
  const navigate = useNavigate()

  const handleNewOptionClick = (option) => {
    setShowNewMenu(false)
    if (option.title === "Job") {
      window.location.href = "/createjob"
    } else if (option.title === "Customer") {
      setShowCustomerModal(true)
    }
  }

  const handleSaveCustomer = (customerData) => {
    console.log("Saving customer:", customerData)
    setShowCustomerModal(false)
    // Here you would typically make an API call to save the customer
  }

  const newOptions = [
    { title: "Job", icon: BarChart2 },
    { title: "Customer", icon: Users }
  ]

  const setupTasks = [
    {
      number: 1,
      title: "Create your services",
      description: "Add the services you offer, along with custom form fields and questionnaires.",
      completed: false,
      link: "/services",
      icon: Users,
    },
    {
      number: 2,
      title: "Create a test job",
      description: "Create a test job from the admin to get a sense of how jobs work in Zenbooker.",
      completed: false,
      link: "/jobs",
      icon: BarChart2,
    },
    {
      number: 3,
      title: "Configure your booking and timeslot settings",
      description:
        "Tailor your booking options by customizing availability, timeslot options, and how far in advance customers can book.",
      completed: false,
      link: "/settings/availability",
      icon: Calendar,
    },
    {
      number: 4,
      title: "Set your business hours",
      description: "Set your operating hours to ensure customers can book times when you're available.",
      completed: false,
      link: "/settings/availability",
      icon: Calendar,
    },
    {
      number: 5,
      title: "Set your service area",
      description: "Set the locations where your business offers service.",
      completed: false,
      link: "/settings/service-areas",
      icon: MapPin,
    },
    {
      number: 6,
      title: "Set up your online booking site",
      description:
        "Customize your booking site with your branding, and edit the text and content to match your business.",
      completed: false,
      link: "/online-booking",
      icon: Globe,
    },
    {
      number: 7,
      title: "Add your team members",
      description: "Invite your team and assign roles so everyone can manage bookings and provide services.",
      completed: false,
      link: "/team",
      icon: Users,
    },
  ]

  const ratingBreakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target)) {
        setShowNewMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleSaveCustomer}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Trial Banner */}
        <div className="bg-orange-50 border-b border-orange-100 px-4 lg:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-800 font-medium">
              13 days left in free trial - 
              <Link to="/settings/billing" className="underline ml-1 hover:text-orange-900 font-semibold">
                Upgrade now
              </Link>
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-semibold text-gray-900">Good evening, Just.</h1>
              <p className="text-sm text-gray-600 mt-1">Here's how Just web Agency is doing today.</p>
            </div>
            <div className="relative" ref={newMenuRef}>
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-primary-700 transition-colors duration-200"
              >
                <span>NEW</span>
                <Plus className="w-4 h-4" />
              </button>
              {showNewMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {newOptions.map((option, index) => (
                    <div
                      key={index}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNewOptionClick(option)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNewOptionClick(option)}
                      className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer select-none active:bg-gray-100 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <option.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{option.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-display font-semibold text-gray-900">Good evening, Just.</h1>
              <p className="text-sm text-gray-600 mt-1">Here's how Just web Agency is doing today.</p>
            </div>
            <div className="relative" ref={newMenuRef}>
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
              {showNewMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {newOptions.map((option, index) => (
                    <div
                      key={index}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNewOptionClick(option)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNewOptionClick(option)}
                      className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer select-none active:bg-gray-100 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <option.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{option.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
              {/* Setup Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold text-gray-900">Finish setting up your account</h2>
                  <span className="text-sm text-gray-500">{setupTasks.filter(task => task.completed).length}/{setupTasks.length} completed</span>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {setupTasks.map((task, index) => (
                    <Link to={task.link} key={index}>
                      <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group relative">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-green-50' : 'bg-primary-50'}`}>
                          {task.completed ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <task.icon className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Today Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-display font-semibold text-gray-900">Today</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 lg:flex lg:items-center lg:space-x-12">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">0</div>
                      <div className="text-gray-600 text-sm mt-1">Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">0h 0m</div>
                      <div className="text-gray-600 text-sm mt-1">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">₦0</div>
                      <div className="text-gray-600 text-sm mt-1">Earnings</div>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="bg-gray-50 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 text-sm">
                    <button className="px-4 py-2 bg-white text-gray-900 font-medium rounded-l-lg border-r border-gray-200">Map</button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-r-lg">Satellite</button>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 mx-auto shadow-sm">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">No scheduled jobs</p>
                    <p className="text-gray-600 text-sm mt-1">Looks like you don't have anything to do today.</p>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-2 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-display font-semibold text-gray-900">Overview</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(Date.now() - (dateRange * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                      - Today
                    </span>
                  </div>
                  <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="form-select rounded-lg border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* New jobs */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">New jobs</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-2 bg-gray-200 rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-primary-600 rounded-full" style={{ width: "0%" }}></div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Jobs */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Jobs</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse flex items-center justify-center py-8">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-900 font-medium">No data to display</p>
                        <p className="text-gray-600 text-sm mt-1">Try changing the date range filter</p>
                      </div>
                    )}
                  </div>

                  {/* New recurring bookings */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">New recurring bookings</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-primary-600 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  {/* Recurring bookings */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Recurring bookings</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="text-center py-8">
                      <p className="text-gray-900 font-medium">No data to display</p>
                      <p className="text-gray-600 text-sm mt-1">Try changing the date range filter</p>
                    </div>
                  </div>

                  {/* Job value */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Job value</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">-</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-primary-600 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  {/* Payments collected */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Payments collected</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">₦0</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-primary-600 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                  {/* Average feedback rating */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Average feedback rating</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-gray-900">0.0</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 text-gray-300" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Total ratings</span>
                        <span className="text-2xl font-bold text-gray-900">0</span>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Recent ratings</span>
                      </div>
                      <div className="text-center py-4">
                        <p className="text-gray-900 font-medium">No data to display</p>
                        <p className="text-gray-600 text-sm mt-1">Try changing the date range filter</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating breakdown */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="w-5 h-5 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Rating breakdown</h3>
                      </div>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="space-y-3">
                      {ratingBreakdown.map((rating) => (
                        <div key={rating.stars} className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 w-20">
                            <span className="text-sm font-medium text-gray-900">{rating.stars}</span>
                            <Star className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">{rating.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service territory performance */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-2 lg:space-y-0">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-primary-600" />
                      <h3 className="text-sm font-medium text-gray-900">Service territory performance</h3>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
                    </div>
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <span>Number of jobs</span>
                      <span>Job value</span>
                    </div>
                  </div>
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">No data to display</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Enable service territories to see a breakdown of job data by location
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerDashboard
