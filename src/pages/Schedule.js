"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import ScheduleSidebar from "../components/schedule-sidebar"
import ScheduleContent from "../components/schedule-content"
import { Plus, ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react"

const ZenbookerSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [scheduleSidebarOpen, setScheduleSidebarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("Sun, Jun 22, 2025")

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
            <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-48 text-center">{selectedDate}</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded">Day</button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
              <button className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
            <button
              onClick={() => setScheduleSidebarOpen(!scheduleSidebarOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
            >
              <span>All Jobs</span>
            </button>
          </div>

          {/* Mobile Date Navigation */}
          <div className="flex items-center justify-between">
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-900">{selectedDate}</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile View Controls */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <button className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded">Day</button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Schedule Sidebar - Desktop */}
          <div className="hidden lg:block">
            <ScheduleSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Schedule Sidebar - Mobile Overlay */}
          {scheduleSidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setScheduleSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                <ScheduleSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              </div>
            </>
          )}

          {/* Main Content Area */}
          <ScheduleContent selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  )
}

export default ZenbookerSchedule
