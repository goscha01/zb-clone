"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { GripVertical, Wrench, Plus, AlertCircle, Loader2 } from "lucide-react"
import CreateServiceModal from "../components/create-service-modal"
import ServiceTemplatesModal from "../components/service-templates-modal"
import { servicesAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ZenbookerServices = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categoriesEnabled, setCategoriesEnabled] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)
  
  // API State
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Fetch services on component mount
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      const response = await servicesAPI.getAll(user.id)
      setServices(response)
    } catch (error) {
      console.error('Error fetching services:', error)
      setError("Failed to load services. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (serviceData) => {
    if (!user?.id) return
    
    try {
      setError("")
      const newService = {
        ...serviceData,
        userId: user.id
      }
      
      const response = await servicesAPI.create(newService)
      
      // Add the new service to the list
      setServices(prev => [response, ...prev])
      setCreateModalOpen(false)
      
      // Navigate to the new service details
      navigate(`/services/${response.id}`)
    } catch (error) {
      console.error('Error creating service:', error)
      
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 400:
            setError(data?.error || "Please check your service information and try again.")
            break
          case 500:
            setError("Server error. Please try again later.")
            break
          default:
            setError(data?.error || "Failed to create service. Please try again.")
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.")
      } else {
        setError("An unexpected error occurred.")
      }
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return
    
    try {
      setDeleteLoading(serviceId)
      setError("")
      
      await servicesAPI.delete(serviceId)
      
      // Remove the service from the list
      setServices(prev => prev.filter(service => service.id !== serviceId))
    } catch (error) {
      console.error('Error deleting service:', error)
      
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 404:
            setError("Service not found.")
            break
          case 500:
            setError("Server error. Please try again later.")
            break
          default:
            setError(data?.error || "Failed to delete service. Please try again.")
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.")
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSelectTemplate = (template) => {
    // TODO: Implement template selection
    setTemplatesModalOpen(false)
    navigate(`/service-details`)
  }

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`)
  }

  const handleRetry = () => {
    fetchServices()
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="services" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Services</h1>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Services List */}
            <div className="bg-white rounded-lg border border-gray-200 mb-8">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="p-8 text-center">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                  <p className="text-gray-500 mb-4">Create your first service to get started</p>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Service
                  </button>
                </div>
              ) : (
                services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between p-4 ${
                      index !== services.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <div 
                      className="flex items-center space-x-4 flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <Wrench className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">
                          {service.price ? `₦${service.price}` : 'Price not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${service.visible ? "bg-green-500" : "bg-yellow-500"}`}></div>
                      <span className={`text-sm ${service.visible ? "text-green-700" : "text-yellow-700"}`}>
                        {service.visible ? "Visible" : "Hidden"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteService(service.id)
                        }}
                        disabled={deleteLoading === service.id}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {deleteLoading === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Service Categories */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Service categories</h3>
                  <p className="text-gray-600">
                    Service categories allow you to organize your services into groups for your booking page.{" "}
                    <button className="text-blue-600 hover:text-blue-700">Learn more</button>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setCategoriesEnabled(!categoriesEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      categoriesEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        categoriesEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateServiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateService={handleCreateService}
        onStartWithTemplate={() => {
          setCreateModalOpen(false)
          setTemplatesModalOpen(true)
        }}
      />

      <ServiceTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}

export default ZenbookerServices
