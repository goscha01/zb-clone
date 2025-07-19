"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { Search, ChevronDown, DollarSign, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

const ZenbookerPayments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="payments" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Search and Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 lg:gap-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Successful charges</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Recorded payments</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Gross revenue</div>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom range</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Jun 17 - Jun 24</span>
                </div>

                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>Any Status</option>
                    <option>Successful</option>
                    <option>Failed</option>
                    <option>Pending</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>All Payment Methods</option>
                    <option>Credit Card</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-lg border border-gray-200 flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments to show</h3>
                <p className="text-gray-600">There are no payments between Jun 17, 2025 - June 24, 2025 to show.</p>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button disabled className="p-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button disabled className="p-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerPayments
