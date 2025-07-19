"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import CreateRecurringOptionModal from "../components/create-recurring-option-modal"
import TerritoryAdjustmentModal from "../components/territory-adjustment-modal"
import ModifierModal from "../components/modifier-modal"
import IntakeQuestionModal from "../components/intake-question-modal"
import { servicesAPI, serviceAvailabilityAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { 
  ChevronLeft,
  ChevronRight,
  Settings,
  Sliders,
  ListChecks,
  Clock,
  ClipboardList,
  RefreshCw,
  ArrowUpDown,
  CreditCard,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  Camera,
  Info,
  HelpCircle,
  MapPin,
  Loader2,
  AlertCircle
} from "lucide-react"

const ServiceDetails = () => {
  const navigate = useNavigate()
  const { serviceId } = useParams()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [editingModifier, setEditingModifier] = useState(null)
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false)
  const [isIntakeDropdownOpen, setIsIntakeDropdownOpen] = useState(false)
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false)
  const [selectedQuestionType, setSelectedQuestionType] = useState(null)
  const [isSkillTagModalOpen, setIsSkillTagModalOpen] = useState(false)
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false)
  const [recurringOptions, setRecurringOptions] = useState([])
  const [territoryRules, setTerritoryRules] = useState([])
  
  // Availability State
  const [availabilityData, setAvailabilityData] = useState({
    availabilityType: 'default',
    businessHoursOverride: null,
    timeslotTemplateId: null,
    minimumBookingNotice: 0,
    maximumBookingAdvance: 525600,
    bookingInterval: 30,
    schedulingRules: [],
    timeslotTemplates: []
  })
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  
  // API State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 0,
    category: "",
    isFree: false,
    bookingType: "bookable",
    displayPrefix: "Estimated Total",
    isTaxable: false,
    hidePrice: false,
    modifiers: [],
    require_payment_method: false
  })

  // Load service data on component mount
  useEffect(() => {
    console.log('ServiceDetails useEffect - serviceId:', serviceId, 'user:', user?.id)
    console.log('Current URL:', window.location.href)
    
    if (!user?.id) {
      console.log('No user found, redirecting to signin')
      navigate('/signin')
      return
    }
    
    if (!serviceId) {
      console.log('No service ID found, redirecting to services')
      navigate('/services')
      return
    }
    
    console.log('Starting to load service data...')
    loadServiceData()
  }, [serviceId, user?.id])

  const loadServiceData = async () => {
    try {
      console.log('Loading service data for ID:', serviceId)
      setLoading(true)
      setError("")
      
      if (!serviceId) {
        console.error('No service ID provided')
        setError("No service ID provided")
        setLoading(false)
        return
      }
      
      // First check if backend is running
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health')
        if (!healthResponse.ok) {
          throw new Error('Backend not responding')
        }
        console.log('Backend is running')
      } catch (healthError) {
        console.error('Backend health check failed:', healthError)
        setError("Backend server is not running. Please start the server and try again.")
        setLoading(false)
        return
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const servicePromise = servicesAPI.getById(serviceId)
      const service = await Promise.race([servicePromise, timeoutPromise])
      
      console.log('Service data received:', service)
      
      if (!service) {
        console.error('No service found')
        setError("Service not found")
        setLoading(false)
        return
      }
      
      // Convert backend data to frontend format
      const hours = Math.floor(service.duration / 60)
      const minutes = service.duration % 60
      
      setServiceData({
        id: service.id,
        name: service.name,
        description: service.description || "",
        price: service.price || 0,
        duration: service.duration || 0,
        category: service.category || "",
        isFree: service.price === 0,
        bookingType: "bookable",
        displayPrefix: "Estimated Total",
        isTaxable: false,
        hidePrice: false,
        modifiers: service.modifiers ? JSON.parse(service.modifiers) : [],
        require_payment_method: !!service.require_payment_method
      })
      
      console.log('Service data set successfully')
      
      // Load availability data
      await loadAvailabilityData()
    } catch (error) {
      console.error('Error loading service:', error)
      
      if (error.message === 'Request timeout') {
        setError("Request timed out. Please check your connection and try again.")
      } else if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 404:
            setError("Service not found. Please check the URL and try again.")
            break
          case 500:
            setError("Server error. Please try again later.")
            break
          default:
            setError(data?.error || "Failed to load service data. Please try again.")
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to load service data. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAvailabilityData = async () => {
    try {
      setAvailabilityLoading(true)
      const availability = await serviceAvailabilityAPI.getAvailability(serviceId)
      setAvailabilityData(availability)
    } catch (error) {
      console.error('Error loading availability:', error)
      // Don't show error for availability, just use defaults
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleSaveAvailability = async () => {
    try {
      setAvailabilitySaving(true)
      await serviceAvailabilityAPI.updateAvailability(serviceId, availabilityData)
      setSuccessMessage("Availability settings updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error saving availability:', error)
      setError("Failed to save availability settings. Please try again.")
    } finally {
      setAvailabilitySaving(false)
    }
  }

  const handleSaveService = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccessMessage("")
      
      const updateData = {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.isFree ? 0 : serviceData.price,
        duration: serviceData.duration,
        category: serviceData.category,
        modifiers: JSON.stringify(serviceData.modifiers),
        require_payment_method: !!serviceData.require_payment_method
      }
      
      await servicesAPI.update(serviceData.id, updateData)
      
      // Show success message
      setSuccessMessage("Service updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error updating service:', error)
      setError("Failed to update service. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const handleEditModifier = (modifier) => {
    setEditingModifier(modifier)
    setIsModifierModalOpen(true)
  }

  const handleSaveModifier = async (modifierData) => {
    try {
      let updatedModifiers
      const currentModifiers = serviceData.modifiers || []
      
    if (editingModifier) {
      // Update existing modifier
        updatedModifiers = currentModifiers.map(mod => 
          mod.id === editingModifier.id ? { ...modifierData, id: mod.id } : mod
        )
    } else {
      // Add new modifier
        updatedModifiers = [...currentModifiers, { ...modifierData, id: Date.now() }]
      }
      
      setServiceData(prev => ({
        ...prev,
        modifiers: updatedModifiers
      }))
      
      // Save to backend
      await handleSaveService()
      
    setIsModifierModalOpen(false)
    setEditingModifier(null)
    } catch (error) {
      console.error('Error saving modifier:', error)
      setError("Failed to save modifier. Please try again.")
    }
  }

  const handleDeleteModifier = async (modifierId) => {
    if (window.confirm("Are you sure you want to delete this modifier?")) {
      try {
        const currentModifiers = serviceData.modifiers || []
        const updatedModifiers = currentModifiers.filter(mod => mod.id !== modifierId)
        setServiceData(prev => ({
          ...prev,
          modifiers: updatedModifiers
        }))
        
        // Save to backend
        await handleSaveService()
      } catch (error) {
        console.error('Error deleting modifier:', error)
        setError("Failed to delete modifier. Please try again.")
      }
    }
  }

  const handleSaveIntakeQuestion = (questionData) => {
    // Handle saving the intake question
    console.log("Saving intake question:", questionData)
    setIsIntakeModalOpen(false)
    setSelectedQuestionType(null)
  }

  const IntakeQuestionDropdown = () => {
    const questionTypes = [
      { icon: "⬇️", label: "Dropdown", value: "dropdown" },
      { icon: "☑️", label: "Multiple Choice", value: "multiple_choice" },
      { icon: "🖼️", label: "Picture Choice", value: "picture_choice" },
      { icon: "📝", label: "Short Text Answer", value: "short_text" },
      { icon: "📄", label: "Long Text Answer", value: "long_text" },
      { icon: "🎨", label: "Color Choice", value: "color_choice" },
      { icon: "📸", label: "Image Upload", value: "image_upload" }
    ]

    const handleQuestionTypeSelect = (type) => {
      setSelectedQuestionType(type)
      setIsIntakeModalOpen(true)
      setIsIntakeDropdownOpen(false)
    }

    return (
      <div className="relative">
        <button
          onClick={() => setIsIntakeDropdownOpen(!isIntakeDropdownOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Intake Question
        </button>
        
        {isIntakeDropdownOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsIntakeDropdownOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleQuestionTypeSelect(type.value)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const SkillTagModal = () => {
    const [skillTagName, setSkillTagName] = useState("")

    const handleClose = () => {
      setIsSkillTagModalOpen(false)
      setSkillTagName("")
    }

    const handleSave = () => {
      // Handle saving the skill tag
      console.log("Saving skill tag:", skillTagName)
      handleClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create a skill tag</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill tag name
                </label>
                <input
                  type="text"
                  value={skillTagName}
                  onChange={(e) => setSkillTagName(e.target.value)}
                  placeholder="Ex: Cleaner, HVAC Tech"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-8">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Save Skill Tag
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionContent = (section) => {
    switch (section.id) {
      case "intake":
        return (
          <div className="p-4 space-y-6">
            <div className="flex items-start space-x-2">
              <p className="text-sm text-gray-600 flex-1">
                Intake questions allow you to collect extra information from your customers during the booking process using custom fields.
              </p>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center whitespace-nowrap">
                <Info className="w-4 h-4 mr-1" />
                Learn more about intake questions
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <IntakeQuestionDropdown />
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <img src="/images/intake-questions.svg" alt="Example question" className="w-full h-auto mb-2" />
                  <p className="text-sm text-gray-500">Add custom fields to collect information</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <img src="/images/feedback-and-reviews-6.svg" alt="Example review" className="w-full h-auto mb-2" />
                  <p className="text-sm text-gray-500">Collect feedback after service completion</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "availability":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              You can override your default business hours and availability settings, and offer custom timeslots for this service using a timeslot template.
            </p>

            {availabilityLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading availability settings...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Availability Type */}
            <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Availability Type</h3>
                  <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                        id="default-availability"
                        name="availability-type"
                        checked={availabilityData.availabilityType === 'default'}
                        onChange={() => setAvailabilityData(prev => ({ ...prev, availabilityType: 'default' }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                      <label htmlFor="default-availability" className="text-sm text-gray-900">
                        Use default business hours and availability settings
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                        id="custom-availability"
                        name="availability-type"
                        checked={availabilityData.availabilityType === 'custom'}
                        onChange={() => setAvailabilityData(prev => ({ ...prev, availabilityType: 'custom' }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                      <label htmlFor="custom-availability" className="text-sm text-gray-900">
                        Use custom availability settings for this service
                </label>
                    </div>
                  </div>
              </div>

                {/* Custom Availability Settings */}
                {availabilityData.availabilityType === 'custom' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900">Custom Availability Settings</h4>
                    
                    {/* Minimum Booking Notice */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Booking Notice (hours)
                      </label>
                  <input
                        type="number"
                        value={Math.floor(availabilityData.minimumBookingNotice / 60)}
                        onChange={(e) => setAvailabilityData(prev => ({ 
                          ...prev, 
                          minimumBookingNotice: parseInt(e.target.value) * 60 
                        }))}
                        min="0"
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Maximum Booking Advance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Booking Advance (days)
                  </label>
                      <input
                        type="number"
                        value={Math.floor(availabilityData.maximumBookingAdvance / 1440)}
                        onChange={(e) => setAvailabilityData(prev => ({ 
                          ...prev, 
                          maximumBookingAdvance: parseInt(e.target.value) * 1440 
                        }))}
                        min="1"
                        max="365"
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                </div>

                    {/* Booking Interval */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking Interval (minutes)
                      </label>
                      <select
                        value={availabilityData.bookingInterval}
                        onChange={(e) => setAvailabilityData(prev => ({ 
                          ...prev, 
                          bookingInterval: parseInt(e.target.value) 
                        }))}
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
              </div>
            </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveAvailability}
                    disabled={availabilitySaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {availabilitySaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Availability Settings</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case "team":
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Required skills</h3>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Learn more
                  </a>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Add required skill tags to make sure jobs booked for this service are assigned to the right team members.
                </p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500 mb-2">No skill tags available</p>
                  <button 
                    onClick={() => setIsSkillTagModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Create new skill tag
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  No skills tags required. Any service provider can be assigned to jobs for this service.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum crew size</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the number of service providers needed to complete this type of service
                </p>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-300 rounded-md text-sm p-2">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                  <span className="text-sm text-gray-600">service provider</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Assignment & job offers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Control how providers are assigned when this service is booked
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="manual-assign"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                      defaultChecked
                    />
                    <div>
                      <label htmlFor="manual-assign" className="text-sm font-medium text-gray-900 block">
                        Manual
                      </label>
                      <p className="text-sm text-gray-500">
                        Jobs for this service will not be automatically assigned or offered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="auto-assign"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <label htmlFor="auto-assign" className="text-sm font-medium text-gray-900 block">
                        Automatically assign
                      </label>
                      <p className="text-sm text-gray-500">
                        Assigns the required number of available providers who possess the necessary skill tags to jobs for this service
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="auto-offer"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <label htmlFor="auto-offer" className="text-sm font-medium text-gray-900 block">
                        Automatically offer
                      </label>
                      <p className="text-sm text-gray-500">
                        Offers jobs for this service to all available providers who possess the necessary skill tags until the required number of providers needed accept
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "recurring":
        return (
          <div className="p-4 space-y-6">
            {recurringOptions.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Recurring options</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Let customers schedule this service as a recurring booking by adding recurring frequencies that customers will be able to choose from. You can also offer discounts for certain frequencies.
                  </p>
                </div>
                <button 
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create a Recurring Option
                </button>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 block">
                  Learn more
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recurring Options</h3>
                  <button 
                    onClick={() => setIsRecurringModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {recurringOptions.map((option, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{option.name}</h4>
                          <p className="text-sm text-gray-600">
                            Every {option.interval} {option.frequency.toLowerCase()}{option.interval > 1 ? 's' : ''}
                            {option.discount !== 'None' && ` • ${option.discount} discount`}
                          </p>
                        </div>
                        <button className="text-red-600 text-sm hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "territory":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Territory adjustments allow you to dynamically increase or decrease this service's price for specific territories
            </p>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Service territory price rules</h3>
                {territoryRules.length > 0 && (
                  <button 
                    onClick={() => setIsTerritoryModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Rule
                  </button>
                )}
              </div>
              
              {territoryRules.length === 0 ? (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        No territory adjustment rules set up yet. Add rules to customize pricing for specific territories.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsTerritoryModalOpen(true)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add Rule
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {territoryRules.map((rule, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.territory}</h4>
                          <p className="text-sm text-gray-600">
                            {rule.operation === 'increase' ? 'Increase' : 'Decrease'} price by{' '}
                            {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
                          </p>
                        </div>
                        <button className="text-red-600 text-sm hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "payments":
        return (
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Require payment method</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Require customers provide a valid payment method when booking this service online?
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">No</span>
                <button
                  onClick={() => setServiceData(prev => ({ ...prev, require_payment_method: !prev.require_payment_method }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${serviceData.require_payment_method ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${serviceData.require_payment_method ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-600">Yes</span>
              </div>
            </div>
          </div>
        )

      case "howItWorks":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Highlight the features of this service or your business, answer common questions customers might have, and showcase reviews from other customers.
            </p>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Frequently asked questions</h3>
                <p className="text-sm text-gray-600 mb-4">Add questions and answers customers might have about this service.</p>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900">What's included in the TV mounting service?</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      Our service includes securely mounting your TV to the wall using your mount or one we offer. We can also select wall stud locations and ensure your TV is level and mounted at the right height. You can also add wire concealment and device setup during booking.
                    </p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add another question</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">How it works</h3>
                <p className="text-sm text-gray-600 mb-4">Walk customers through how this service works, including what happens next after booking.</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Select your options</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose your TV size, wall mount type, and any additional services like wire concealment or device setup.
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add another step</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Highlights</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Emphasize important features of this service or your business to customers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-sm text-gray-900">Fast Service</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Testimonials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show reviews and testimonials from your satisfied past customers.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
              </div>
            </div>
          </div>
        )

      case "bookingPage":
        return (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Visibility</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you hide this service from your booking page, customers will only be able to book it if you link directly to it or embed it
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-3 text-sm text-gray-900">Show service on booking page</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Hide service on booking page</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Confirmation page</h3>
              <p className="text-sm text-gray-600 mb-4">
                Customize what should happen after a customer books this service from your booking page
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-3 text-sm text-gray-900">Display default confirmation message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Display custom confirmation message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Redirect to external site</span>
                </label>
              </div>
            </div>
          </div>
        )

      case "bookingLink":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Customers can book this service from your booking page. You can also link directly to this service or embed it inside a widget.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Direct link to book this service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You can copy and paste this link to share this service's booking form with your customers.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value="https://widget.zenbooker.com/book/justwebagency?preselected=1"
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50"
                  />
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Copy
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Embed this service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Embed the booking page for this service on your website. Choose from four different embed widgets.
                </p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Embed Service
                </button>
              </div>
            </div>
          </div>
        )

      case "details":
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={serviceData.category}
                  onChange={(e) => setServiceData({ ...serviceData, category: e.target.value })}
                  placeholder="e.g., Cleaning, Installation, Repair"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Base Price and Duration</label>
                    <div className="flex gap-4 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Base duration <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={Math.floor(serviceData.duration / 60)}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value) || 0
                              const minutes = serviceData.duration % 60
                              setServiceData({ ...serviceData, duration: hours * 60 + minutes })
                            }}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                          />
                          <span className="text-sm text-gray-600 py-1">hours</span>
                          <input
                            type="number"
                            value={serviceData.duration % 60}
                            onChange={(e) => {
                              const hours = Math.floor(serviceData.duration / 60)
                              const minutes = parseInt(e.target.value) || 0
                              setServiceData({ ...serviceData, duration: hours * 60 + minutes })
                            }}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                          />
                          <span className="text-sm text-gray-600 py-1">minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Base price <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                        <div className="flex gap-2">
                          <span className="text-sm text-gray-600 py-1">$</span>
                          <input
                            type="number"
                            value={serviceData.price}
                            onChange={(e) => setServiceData({ ...serviceData, price: parseFloat(e.target.value) || 0 })}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                            disabled={serviceData.isFree}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={serviceData.isFree}
                          onChange={(e) => setServiceData({ ...serviceData, isFree: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">This service is free</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Booking page behavior</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'bookable' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'bookable' })}>
                        <div className="flex justify-center mb-2">📅</div>
                        <h3 className="text-sm font-medium text-center mb-1">Bookable</h3>
                        <p className="text-xs text-gray-500 text-center">Customers can directly book available times for this service.</p>
                      </div>
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'request' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'request' })}>
                        <div className="flex justify-center mb-2">🗓️</div>
                        <h3 className="text-sm font-medium text-center mb-1">Booking Request</h3>
                        <p className="text-xs text-gray-500 text-center">Customers propose multiple times, and you confirm one.</p>
                      </div>
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'quote' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'quote' })}>
                        <div className="flex justify-center mb-2">💰</div>
                        <h3 className="text-sm font-medium text-center mb-1">Quote Request</h3>
                        <p className="text-xs text-gray-500 text-center">Customers provide details, and you send them a custom price quote.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Price display options</label>
                    <p className="text-sm text-gray-500 mb-3">Control how pricing should be displayed to customers.</p>
                    
                    <div className="mb-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={serviceData.hidePrice}
                          onChange={(e) => setServiceData({ ...serviceData, hidePrice: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">Don't show price when booking online</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Display prefix <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                      <input
                        type="text"
                        value={serviceData.displayPrefix}
                        onChange={(e) => setServiceData({ ...serviceData, displayPrefix: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1"
                      />
                      <p className="text-sm text-gray-500">${serviceData.price}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Taxes</label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceData.isTaxable}
                        onChange={(e) => setServiceData({ ...serviceData, isTaxable: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-600">This service is taxable</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveService}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-48">
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <button className="text-sm text-blue-600 font-medium">Add an image</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "modifiers":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">Service modifiers are groups of options that can adjust this service's price and duration when selected.</p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Learn more about service modifiers
            </a>

            <div className="space-y-4">
              {serviceData.modifiers && serviceData.modifiers.length > 0 ? (
                serviceData.modifiers.map((modifier, index) => (
                <div key={modifier.id} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">⋮⋮</span>
                      <span className="font-medium">{modifier.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditModifier(modifier)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteModifier(modifier.id)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {modifier.options && modifier.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                          {option.label}
                          {option.price && <span className="text-gray-500 ml-1">{option.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No modifiers added yet.</p>
                  <p className="text-sm mt-1">Click "New Modifier Group" to add your first modifier.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                setEditingModifier(null)
                setIsModifierModalOpen(true)
              }}
              className="w-full border border-gray-300 rounded-lg p-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              New Modifier Group
            </button>
          </div>
        )

      default:
        return null
    }
  }

  const handleSaveRecurringOption = (recurringOption) => {
    setRecurringOptions(prev => [...prev, recurringOption])
  }

  const handleSaveTerritoryRule = (rule) => {
    setTerritoryRules(prev => [...prev, rule])
  }

  const sections = [
    {
      id: "details",
      icon: Settings,
      title: "Service Details",
      description: "Name, description, duration, and price",
    },
    {
      id: "modifiers",
      icon: Sliders,
      title: "Service Modifiers",
      description: "Add selectable options that can adjust this service's price and duration",
      badge: "2 Modifier Groups"
    },
    {
      id: "intake",
      icon: ListChecks,
      title: "Intake Questions",
      description: "Add custom form fields to collect additional info"
    },
    {
      id: "availability",
      icon: Clock,
      title: "Availability",
      description: "Use your business's default hours, or show custom timeslots for this service"
    },
    {
      id: "team",
      icon: ClipboardList,
      title: "Team Requirements & Assignment Options",
      description: "Add required skills and customize how jobs should be assigned for this service"
    },
    {
      id: "recurring",
      icon: RefreshCw,
      title: "Recurring Options",
      description: "Give customers the option to book this service as a recurring appointment"
    },
    {
      id: "territory",
      icon: ArrowUpDown,
      title: "Territory Adjustments",
      description: "Customize pricing for this service based on which territory it's booked in"
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "Payments",
      description: "No payment method required"
    },
    {
      id: "howItWorks",
      icon: FileText,
      title: "How it Works, FAQ, Testimonials, & Highlights",
      description: "Showcase attributes about this service or your business when customers book online"
    },
    {
      id: "bookingPage",
      icon: Globe,
      title: "Booking Page",
      description: "Hidden on booking page • Default confirmation message"
    },
    {
      id: "bookingLink",
      icon: ExternalLink,
      title: "Booking Link & Widgets",
      description: "Embed this service in a booking widget or link directly to it"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="services" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <button
                onClick={() => navigate("/services")}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Services
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 mt-2">
                {serviceData.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={loadServiceData}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Success Display */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading service details...</p>
                </div>
              </div>
            ) : error && error.includes("not found") ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Service Not Found</h3>
                  <p className="text-gray-500 mb-4">The service you're looking for doesn't exist or has been deleted.</p>
                  <button
                    onClick={() => navigate('/services')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Services
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <section.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
                        <div>
                          <h2 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                            <span>{section.title}</span>
                            {section.badge && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {section.badge}
                              </span>
                            )}
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                          expandedSection === section.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedSection === section.id && renderSectionContent(section)}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
      <ModifierModal
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false)
          setEditingModifier(null)
        }}
        editingModifier={editingModifier}
        onSave={handleSaveModifier}
      />
      <IntakeQuestionModal
        isOpen={isIntakeModalOpen}
        onClose={() => {
          setIsIntakeModalOpen(false)
          setSelectedQuestionType(null)
        }}
        selectedQuestionType={selectedQuestionType}
        onSave={handleSaveIntakeQuestion}
      />
      {isSkillTagModalOpen && <SkillTagModal />}
      <CreateRecurringOptionModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave={handleSaveRecurringOption}
      />
      <TerritoryAdjustmentModal
        isOpen={isTerritoryModalOpen}
        onClose={() => setIsTerritoryModalOpen(false)}
        onSave={handleSaveTerritoryRule}
      />
    </div>
  )
}

export default ServiceDetails 