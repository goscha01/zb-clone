"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import EstimatePreview from "../components/estimate-preview"
import EstimatesFeature from "../components/estimates-feature"
import { Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const ZenbookerEstimates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  
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
            <h1 className="text-2xl font-display font-semibold text-gray-900">Estimates</h1>
            <button 
              onClick={() => navigate('/bookable-estimate')} 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </button>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-semibold text-gray-900">Estimates</h1>
            <Link 
              to="/bookable-estimate"
              className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-12">
            <div className="space-y-12 lg:space-y-16">
              {/* Estimate Preview */}
              <div className="flex justify-center">
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <EstimatePreview />
                </div>
              </div>

              {/* Feature Description */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 lg:p-8">
                <EstimatesFeature />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerEstimates
