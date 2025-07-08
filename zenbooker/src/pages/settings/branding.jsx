"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { ChevronLeft } from "lucide-react"

const BrandingSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    logo: null,
    showLogoInAdmin: false,
    primaryColor: "#4CAF50",
  })

  const colors = [
    // Row 1
    "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
    // Row 2
    "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
    // Row 3
    "#795548", "#607D8B"
  ]

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Here you would typically handle the file upload to your server
      // For now, we'll just store it in state
      setSettings({ ...settings, logo: file })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
            <h1 className="text-2xl font-semibold text-gray-900">Branding</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 mb-6">
                Customize your emails and rescheduling page to match your brand.
              </p>
              <p className="text-gray-600 mb-8">
                You can customize branding and appearance of you booking page separately in{" "}
                <button 
                  onClick={() => navigate("/online-booking")}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Online Booking &gt; Appearance and branding
                </button>
              </p>

              {/* Logo Upload */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Logo</h3>
                <p className="text-sm text-gray-500 mb-4">
                  HEIC, PNG, or JPG.
                  <br />
                  Recommended width: 512 pixels minimum.
                </p>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-gray-500 hover:text-gray-600"
                    >
                      Click to upload logo
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show logo in Zenbooker admin</span>
                  <button
                    onClick={() => setSettings({ ...settings, showLogoInAdmin: !settings.showLogoInAdmin })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                      settings.showLogoInAdmin ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.showLogoInAdmin ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Primary color</h3>
                <p className="text-sm text-gray-500 mb-4">This color will be used for buttons and certain icons</p>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings({ ...settings, primaryColor: color })}
                      className={`w-8 h-8 rounded-full ${
                        settings.primaryColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <span className="text-sm text-gray-600 uppercase">{settings.primaryColor}</span>
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

export default BrandingSettings