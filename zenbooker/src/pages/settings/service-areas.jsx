"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { ChevronLeft, MapPin } from "lucide-react"

const ServiceAreas = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [enforceServiceArea, setEnforceServiceArea] = useState(true)
  const navigate = useNavigate()

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
            <h1 className="text-2xl font-semibold text-gray-900">Service Areas</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Enforce Service Area Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-gray-900">Enforce Service Area</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Prevent customers from booking jobs online at locations that are outside of your territories' service areas.
                  </p>
                </div>
                <button
                  onClick={() => setEnforceServiceArea(!enforceServiceArea)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    enforceServiceArea ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={enforceServiceArea}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enforceServiceArea ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Service Areas Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">Service Areas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  These are the service areas for each of your territories.
                </p>
              </div>

              {/* Map and Territory Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Map */}
                <div className="h-96 bg-green-50 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12097.433213460975!2d-73.99728968144034!3d40.69531900080547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a47c1654a45%3A0xc49e101c2fd62ba2!2sBrooklyn%20Heights%2C%20Brooklyn%2C%20NY!5e0!3m2!1sen!2sus!4v1709665144705!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  <button className="absolute right-4 top-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 3L21 3M21 3V9M21 3L13 11M10 5H7C4.79086 5 3 6.79086 3 9V17C3 19.2091 4.79086 21 7 21H15C17.2091 21 19 19.2091 19 17V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Territory Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Brooklyn Heights</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">157 Montague Street, Brooklyn Heights, New York 11201...</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">SERVICE AREA</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">30 mile radius</span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    </div>
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

export default ServiceAreas
