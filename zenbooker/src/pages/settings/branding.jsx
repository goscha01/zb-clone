"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { ChevronLeft, Check, X } from "lucide-react"
import { brandingAPI, authAPI } from "../../services/api"

const BrandingSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
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

  // Get current user
  const currentUser = authAPI.getCurrentUser()

  useEffect(() => {
    if (currentUser) {
      loadBrandingData()
    } else {
      navigate('/signin')
    }
  }, [currentUser])

  const loadBrandingData = async () => {
    try {
      setLoading(true)
      const branding = await brandingAPI.getBranding(currentUser.id)
      setSettings(branding)
    } catch (error) {
      console.error('Error loading branding data:', error)
      setMessage({ type: 'error', text: 'Failed to load branding settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, we'll create a local URL and store it
      const logoUrl = URL.createObjectURL(file)
      setSettings({ ...settings, logo: logoUrl })
    }
  }

  const handleSaveBranding = async () => {
    try {
      setSaving(true)
      await brandingAPI.updateBranding({
        userId: currentUser.id,
        logo: settings.logo,
        showLogoInAdmin: settings.showLogoInAdmin,
        primaryColor: settings.primaryColor
      })
      
      setMessage({ type: 'success', text: 'Branding settings saved successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving branding settings:', error)
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save branding settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading branding settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
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

        {/* Message */}
        {message.text && (
          <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-green-400 mr-2" />
              ) : (
                <X className="w-5 h-5 text-red-400 mr-2" />
              )}
              <span className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

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
                {settings.logo && (
                  <div className="mt-4">
                    <img 
                      src={settings.logo} 
                      alt="Logo preview" 
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
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

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveBranding}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandingSettings