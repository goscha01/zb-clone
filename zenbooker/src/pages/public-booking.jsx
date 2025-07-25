"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { 
  MapPin, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Star
} from "lucide-react"
import axios from "axios"

// Create axios instance for public API calls
const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://zenbookapi.now2code.online/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API base URL for Google Places API proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zenbookapi.now2code.online'

const PublicBooking = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    postalCode: "",
    service: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(null)
  const [couponError, setCouponError] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [availableServices, setAvailableServices] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)

  // Get business slug from URL parameters
  const { userSlug } = useParams()
  // Try to extract user ID from slug, or use fallback
  const businessSlug = userSlug || '1' // Use user ID directly as fallback
  
  // Debug: Log the business slug
  console.log('Business slug:', businessSlug)
  console.log('URL params:', useParams())

  // Load business settings and services
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setLoading(true)
        
        // Load business settings
        const settingsResponse = await publicApi.get(`/public/business/${businessSlug}/settings`)
        setSettings(settingsResponse.data)
        
        // Load available services
        const servicesResponse = await publicApi.get(`/public/business/${businessSlug}/services`)
        setAvailableServices(servicesResponse.data)
        
      } catch (error) {
        console.error('Error loading business data:', error)
        setError('Business not found or unavailable')
      } finally {
        setLoading(false)
      }
    }

    loadBusinessData()
  }, [businessSlug])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = async (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, address: value }))
    
    if (value.length > 3) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/places/autocomplete?input=${encodeURIComponent(value)}`
        )
        const data = await response.json()
        
        if (data.predictions) {
          setAddressSuggestions(data.predictions)
          setShowAddressSuggestions(true)
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
      }
    } else {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    }
  }

  const handleAddressSelect = async (suggestion) => {
    try {
      // Get detailed place information
      const response = await fetch(
        `${API_BASE_URL}/places/details?place_id=${suggestion.place_id}`
      )
      const data = await response.json()
      
      if (data.result) {
        const place = data.result
        let city = ""
        let state = ""
        let zipCode = ""
        
        // Extract address components
        place.address_components.forEach(component => {
          if (component.types.includes('locality')) {
            city = component.long_name
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name
          } else if (component.types.includes('postal_code')) {
            zipCode = component.long_name
          }
        })
        
        setFormData(prev => ({
          ...prev,
          address: suggestion.description,
          city: city,
          state: state,
          zipCode: zipCode
        }))
      } else {
        // Fallback if detailed info not available
        setFormData(prev => ({ ...prev, address: suggestion.description }))
      }
    } catch (error) {
      console.error('Error fetching place details:', error)
      // Fallback to just the description
      setFormData(prev => ({ ...prev, address: suggestion.description }))
    }
    
    setShowAddressSuggestions(false)
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await publicApi.post(`/public/business/${businessSlug}/book`, formData)
      setCurrentStep(6) // Success step
    } catch (error) {
      setError('Failed to submit booking. Please try again.')
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    const selectedService = availableServices.find(s => s.id === formData.service)
    if (!selectedService) {
      setCouponError("Please select a service first")
      return
    }

    try {
      setValidatingCoupon(true)
      setCouponError("")
      
      const response = await publicApi.post('/coupons/validate', {
        code: couponCode,
        businessSlug: businessSlug,
        serviceId: selectedService.id,
        totalAmount: selectedService.price || 0
      })

      setCouponDiscount(response.data.coupon)
      setCouponError("")
    } catch (error) {
      console.error('Coupon validation error:', error)
      setCouponError(error.response?.data?.error || "Invalid coupon code")
      setCouponDiscount(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode("")
    setCouponDiscount(null)
    setCouponError("")
  }

  const getSelectedServicePrice = () => {
    const selectedService = availableServices.find(s => s.id === formData.service)
    if (!selectedService) return 0
    
    const price = selectedService.price
    // Handle different price formats
    if (typeof price === 'number') return price
    if (typeof price === 'string') {
      const parsed = parseFloat(price)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const getFinalPrice = () => {
    const basePrice = getSelectedServicePrice()
    if (couponDiscount && typeof couponDiscount.finalAmount === 'number') {
      return couponDiscount.finalAmount
    }
    return basePrice
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: settings?.branding?.headerBackground || '#ffffff' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: settings?.branding?.primaryColor || '#4CAF50' }}></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Booking Unavailable</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings?.branding?.headerBackground || '#ffffff' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {settings?.branding?.logo ? (
              <img 
                src={settings.branding.logo} 
                alt="Logo" 
                className="h-8 object-contain"
              />
            ) : (
              <h1 className="text-xl font-semibold" style={{ color: settings?.branding?.primaryColor || '#4CAF50' }}>
                {settings?.content?.heading || 'Book Online'}
              </h1>
            )}
            
            {!settings?.branding?.hideZenbookerBranding && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>Powered by</span>
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Z</span>
                </div>
                <span>zenbooker</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {settings?.branding?.heroImage && (
        <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${settings.branding.heroImage})` }}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">{settings?.content?.heading || 'Book Online'}</h2>
              <p className="text-lg">{settings?.content?.text || "Let's get started by entering your postal code."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep 
                        ? 'text-white' 
                        : 'text-gray-500 bg-gray-200'
                    }`} style={{ 
                      backgroundColor: step <= currentStep ? (settings?.branding?.primaryColor || '#4CAF50') : undefined 
                    }}>
                      {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    {step < 5 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Location */}
              {currentStep === 1 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Enter Your Location</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      />
                    </div>
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.postalCode.trim()}
                      className="w-full py-3 px-4 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: settings?.branding?.primaryColor || '#4CAF50' }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Service Selection */}
              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Select a Service</h3>
                  <div className="space-y-4">
                    {availableServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => {
                          handleInputChange('service', service.id)
                          handleNextStep()
                        }}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            {settings?.general?.showPrices && (
                              <p className="text-lg font-semibold mt-2" style={{ color: settings?.branding?.primaryColor || '#4CAF50' }}>
                                ${service.price}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Select Date & Time</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <select
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.date || !formData.time}
                      className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: settings?.branding?.primaryColor || '#4CAF50' }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Contact Information */}
              {currentStep === 4 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                        style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter your address"
                          value={formData.address}
                          onChange={handleAddressChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                          style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                        />
                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {addressSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleAddressSelect(suggestion)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="text-sm text-gray-900">{suggestion.description}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.name || !formData.email || !formData.phone}
                      className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: settings?.branding?.primaryColor || '#4CAF50' }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Confirm */}
              {currentStep === 5 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
                  
                  {/* Pricing and Coupon Section */}
                  {formData.service && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                      
                      {/* Service Price */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {availableServices.find(s => s.id === formData.service)?.name}
                          </span>
                          <span className="font-medium">
                            ${(getSelectedServicePrice() || 0).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Coupon Section */}
                        {!couponDiscount ? (
                          <div className="border-t pt-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:outline-none"
                                style={{ '--tw-ring-color': settings?.branding?.primaryColor || '#4CAF50' }}
                              />
                              <button
                                onClick={validateCoupon}
                                disabled={validatingCoupon || !couponCode.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {validatingCoupon ? 'Validating...' : 'Apply'}
                              </button>
                            </div>
                            {couponError && (
                              <p className="text-red-600 text-sm mt-1">{couponError}</p>
                            )}
                          </div>
                        ) : (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600 text-sm">✓ Coupon applied</span>
                                <span className="text-sm text-gray-600">({couponCode})</span>
                              </div>
                              <button
                                onClick={removeCoupon}
                                className="text-red-600 text-sm hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-600 text-sm">Discount:</span>
                              <span className="text-green-600 font-medium">
                                -${(couponDiscount.calculatedDiscount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Total */}
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-gray-900">
                              ${(getFinalPrice() || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">
                          {availableServices.find(s => s.id === formData.service)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{formData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: settings?.branding?.primaryColor || '#4CAF50' }}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Success */}
              {currentStep === 6 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your booking. We'll send you a confirmation email shortly.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: settings?.branding?.primaryColor || '#4CAF50' }}
                  >
                    Book Another Service
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Professional Service</h4>
                    <p className="text-sm text-gray-600">Experienced team with attention to detail</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Reliable & Trusted</h4>
                    <p className="text-sm text-gray-600">Serving customers with excellence</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Easy Booking</h4>
                    <p className="text-sm text-gray-600">Quick and convenient online booking</p>
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

export default PublicBooking 