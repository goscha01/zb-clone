"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import RequestsSidebar from "../components/requests-sidebar"
import EmptyState from "../components/empty-state"
import { ChevronDown, Filter } from "lucide-react"

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
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-5 items-center justify-between shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-display font-semibold text-gray-900">Requests</h1>
              <div className="flex items-center space-x-1">
                <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-b-2 border-primary-600 hover:text-primary-700 transition-colors">
                  All
                </button>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <span>Open</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-semibold text-gray-900">Requests</h1>
            <button
              onClick={() => setRequestsSidebarOpen(!requestsSidebarOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1 mt-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-b-2 border-primary-600 hover:text-primary-700 transition-colors">
              All
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Requests Sidebar - Desktop */}
          <div className="hidden lg:block w-64 border-r border-gray-200 bg-white">
            <RequestsSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Requests Sidebar - Mobile Overlay */}
          {requestsSidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setRequestsSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                <div className="h-full bg-white shadow-xl">
                  <RequestsSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
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
                        activeFilter === type 
                          ? "bg-primary-50 text-primary-700" 
                          : "text-gray-700 hover:bg-gray-100"
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
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <EmptyState />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerRequests
