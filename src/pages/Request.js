"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import RequestsSidebar from "../components/requests-sidebar"
import EmptyState from "../components/empty-state"
import { ChevronDown } from "lucide-react"

const ZenbookerRequests = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [requestsSidebarOpen, setRequestsSidebarOpen] = useState(false)

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
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-semibold text-gray-900">Requests</h1>
            <div className="flex items-center space-x-1">
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-b-2 border-blue-600">
                All
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Open</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Requests</h1>
            <button
              onClick={() => setRequestsSidebarOpen(!requestsSidebarOpen)}
              className="lg:hidden flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
            >
              <span>All</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1 mt-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-b-2 border-blue-600">
              All
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Requests Sidebar - Desktop */}
          <div className="hidden lg:block">
            <RequestsSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Requests Sidebar - Mobile Overlay */}
          {requestsSidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setRequestsSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                <RequestsSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              </div>
            </>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Mobile Filter Dropdown */}
            {requestsSidebarOpen && (
              <div className="lg:hidden bg-gray-50 border-b border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">REQUEST TYPE</h3>
                <div className="space-y-1">
                  {["all", "booking", "quote"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveFilter(type)
                        setRequestsSidebarOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === type ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {type === "all" && "All"}
                      {type === "booking" && "Booking Requests"}
                      {type === "quote" && "Quote Requests"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            <EmptyState />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerRequests
