"use client"

import { X, MapPin, Search } from "lucide-react"
import { useState, useEffect } from "react"

const CustomerModal = ({ isOpen, onClose, onSave }) => {
  const [customerData, setCustomerData] = useState({
    name: "",
    address: "",
    apartment: "",
    phone: "",
    email: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)

  // Google Places API key
  const GOOGLE_API_KEY = "AIzaSyC_CrJWTsTHOTBd7TSzTuXOfutywZ2AyOQ"

  useEffect(() => {
    if (!isOpen) {
      setCustomerData({
        name: "",
        address: "",
        apartment: "",
        phone: "",
        email: "",
        notes: ""
      })
      setError("")
      setValidationErrors({})
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      e.preventDefault()
      onClose()
    }
  }

  const validateEmail = (email) => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    if (!phone) return true // Phone is optional
    // Remove all non-digit characters except + for international numbers
    const cleaned = phone.replace(/[^\d+]/g, '')
    // Basic validation - should have at least 10 digits
    const digits = cleaned.replace(/[^\d]/g, '')
    return digits.length >= 10
  }

  const validateField = (field, value) => {
    const errors = { ...validationErrors }
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
      case 'phone':
        if (value && !validatePhone(value)) {
          errors.phone = 'Please enter a valid phone number (at least 10 digits)'
        } else {
          delete errors.phone
        }
        break
      case 'name':
        if (!value.trim()) {
          errors.name = 'Customer name is required'
        } else {
          delete errors.name
        }
        break
    }
    
    setValidationErrors(errors)
  }

  const formatPhone = (phone) => {
    if (!phone) return phone
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`
    } else if (cleaned.length > 10) {
      // International format
      return `+${cleaned}`
    }
    return phone
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    const formatted = formatPhone(value)
    setCustomerData({ ...customerData, phone: formatted })
    validateField('phone', formatted)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setCustomerData({ ...customerData, email: value })
    validateField('email', value)
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setCustomerData({ ...customerData, name: value })
    validateField('name', value)
  }

  const handleAddressChange = async (e) => {
    const value = e.target.value
    setCustomerData({ ...customerData, address: value })
    
    if (value.length > 3) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(value)}&key=${GOOGLE_API_KEY}&types=address`
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

  const handleAddressSelect = (suggestion) => {
    setCustomerData({ ...customerData, address: suggestion.description })
    setShowAddressSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setError("")
    
    // Validate required fields
    if (!customerData.name.trim()) {
      setError('Customer name is required')
      return
    }
    
    // Validate email if provided
    if (customerData.email && !validateEmail(customerData.email)) {
      setError('Please enter a valid email address (e.g., email@example.com)')
      return
    }
    
    // Validate phone if provided
    if (customerData.phone && !validatePhone(customerData.phone)) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }
    
    setLoading(true)
    
    try {
      // Split name into first and last name
      const nameParts = customerData.name.trim().split(' ')
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(' ') || ""
      
      const customerToSave = {
        firstName,
        lastName,
        address: customerData.address,
        apartment: customerData.apartment,
        phone: customerData.phone,
        email: customerData.email,
        notes: customerData.notes
      }
      
      console.log('Submitting customer data:', customerToSave)
      await onSave(customerToSave)
      console.log('Customer saved successfully, closing modal')
      onClose()
    } catch (error) {
      console.error('Error in customer modal submit:', error)
      setError(error.message || 'Failed to save customer. Please try again.')
      // Don't close the modal on error - keep it open so user can fix the issue
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md relative my-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">New Customer</h2>
            <button
              onClick={(e) => {
                e.preventDefault()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="First and Last Name"
                value={customerData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm ${
                  validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={customerData.address}
                  onChange={handleAddressChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
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

            {/* Apartment/Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment/Unit
              </label>
              <input
                type="text"
                placeholder="Apt, Unit, Suite, etc."
                value={customerData.apartment}
                onChange={(e) => setCustomerData({ ...customerData, apartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={customerData.phone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm ${
                  validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={customerData.email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm ${
                  validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                placeholder="Customer notes..."
                value={customerData.notes}
                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onClose()
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || Object.keys(validationErrors).length > 0}
                onClick={(e) => {
                  if (loading || Object.keys(validationErrors).length > 0) {
                    e.preventDefault()
                    return
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal 