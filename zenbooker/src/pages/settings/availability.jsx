"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { ChevronLeft, MapPin, ChevronRight } from "lucide-react"
import TimeslotTemplateModal from "../../components/timeslot-template-modal"

const Availability = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTimeslotTemplateModalOpen, setIsTimeslotTemplateModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleSaveTimeslotTemplate = (template) => {
    // Handle saving the template
    console.log('Saving template:', template)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
          </div>
          {/* <button
            onClick={() => navigate("/settings/availability/locateme")}
            className="mt-4 flex items-center justify-between w-full md:w-80 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">locateme</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button> */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Hours of Operation */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">Hours of Operation</h2>
              <p className="text-gray-600 mt-2 mb-4">
                This section allows you to set your typical business hours for your locations. Business hours affect the
                time slots that customers can book online.
              </p>

              <button  onClick={() => navigate("/settings/availability/locateme")} className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">locateme</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Timeslot Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Timeslot Templates</h2>
                  <p className="text-gray-600 mt-1">
                    You can override your default hours of operation and timeslot settings for specific services using
                    timeslot templates. <button className="text-blue-600 hover:text-blue-700">Learn more</button>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-4">No timeslot templates created yet</p>
                <button 
                  onClick={() => setIsTimeslotTemplateModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  New Timeslot Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TimeslotTemplateModal 
        isOpen={isTimeslotTemplateModalOpen}
        onClose={() => setIsTimeslotTemplateModalOpen(false)}
        onSave={handleSaveTimeslotTemplate}
      />
    </div>
  )
}

export default Availability
