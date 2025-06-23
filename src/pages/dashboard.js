"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { Plus, ChevronDown, Info, Star, Calendar } from "lucide-react"

const ZenbookerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const setupTasks = [
    {
      number: 1,
      title: "Create your services",
      description: "Add the services you offer, along with custom form fields and questionnaires.",
      completed: false,
    },
    {
      number: 2,
      title: "Create a test job",
      description: "Create a test job from the admin to get a sense of how jobs work in Zenbooker.",
      completed: false,
    },
    {
      number: 3,
      title: "Configure your booking and timeslot settings",
      description:
        "Tailor your booking options by customizing availability, timeslot options, and how far in advance customers can book.",
      completed: false,
    },
    {
      number: 4,
      title: "Set your business hours",
      description: "Set your operating hours to ensure customers can book times when you're available.",
      completed: false,
    },
    {
      number: 5,
      title: "Set your service area",
      description: "Set the locations where your business offers service.",
      completed: false,
    },
    {
      number: 6,
      title: "Set up your online booking site",
      description:
        "Customize your booking site with your branding, and edit the text and content to match your business.",
      completed: false,
    },
    {
      number: 7,
      title: "Add your team members",
      description: "Invite your team and assign roles so everyone can manage bookings and provide services.",
      completed: false,
    },
  ]

  const ratingBreakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Trial Banner */}
        <div className="bg-orange-50 border-b border-orange-200 px-4 lg:px-6 py-3">
          <p className="text-sm text-orange-800 text-center">13 days left in free trial</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Good evening, Just.</h1>
              <p className="text-sm text-gray-600 mt-1">Here's how Just web Agency is doing today.</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-blue-700">
              <span>New</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Good evening, Just.</h1>
            <p className="text-sm text-gray-600 mt-1">Here's how Just web Agency is doing today.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
              {/* Setup Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Finish setting up your account</h2>
                <div className="space-y-3 lg:space-y-4">
                  {setupTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-gray-600">{task.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Today Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <h2 className="text-lg font-semibold text-gray-900">Today</h2>
                  <div className="grid grid-cols-3 gap-4 lg:flex lg:items-center lg:space-x-8 text-sm">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">0</div>
                      <div className="text-gray-600 text-xs lg:text-sm">jobs</div>
                      <div className="text-xs text-gray-500 hidden lg:block">for this schedule</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">0h 0m</div>
                      <div className="text-gray-600 text-xs lg:text-sm">Est. duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">NO</div>
                      <div className="text-gray-600 text-xs lg:text-sm">Est. earnings</div>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="bg-green-100 rounded-lg h-48 lg:h-64 flex items-center justify-center relative">
                  <div className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-white rounded shadow-sm border border-gray-200 text-xs lg:text-sm">
                    <button className="px-2 lg:px-3 py-1 bg-white border-r border-gray-200">Map</button>
                    <button className="px-2 lg:px-3 py-1 text-gray-600">Satellite</button>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">No scheduled jobs</p>
                    <p className="text-gray-500 text-xs">Looks like you don't have anything to do today.</p>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-2 lg:space-y-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                    <span className="text-sm text-gray-500">Jun 15 - Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Last 7 days</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {/* New jobs */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">New jobs</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">0</div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  {/* Jobs */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Jobs</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-center py-6 lg:py-8">
                      <p className="text-gray-500 text-sm">No data to display</p>
                      <p className="text-gray-400 text-xs">Try changing the date range filter at the top of the page</p>
                    </div>
                  </div>

                  {/* New recurring bookings */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">New recurring bookings</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">0</div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  {/* Recurring bookings */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Recurring bookings</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-center py-6 lg:py-8">
                      <p className="text-gray-500 text-sm">No data to display</p>
                      <p className="text-gray-400 text-xs">Try changing the date range filter at the top of the page</p>
                    </div>
                  </div>

                  {/* Job value */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Job value</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">-</div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>

                  {/* Payments collected */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Payments collected</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">₦0</div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200">
                  {/* Average feedback rating */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Average feedback rating</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-900">0.0</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">Total ratings</span>
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-2xl font-bold text-gray-900">0</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">Recent ratings</span>
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No data to display</p>
                        <p className="text-gray-400 text-xs">
                          Try changing the date range filter at the top of the page
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating breakdown */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Rating breakdown</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      {ratingBreakdown.map((rating) => (
                        <div key={rating.stars} className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 w-8">{rating.stars} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600 w-4">{rating.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service territory performance */}
                <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-2 lg:space-y-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">Service territory performance</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>Number of jobs</span>
                      <span>Job value</span>
                    </div>
                  </div>
                  <div className="text-center py-6 lg:py-8">
                    <p className="text-gray-500 text-sm">No data to display</p>
                    <p className="text-gray-400 text-xs">
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
