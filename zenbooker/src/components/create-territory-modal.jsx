"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Clock, Users, Wrench, DollarSign, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { territoriesAPI, servicesAPI, teamAPI } from "../services/api"
import LoadingButton from "./loading-button"

const CreateTerritoryModal = ({ isOpen, onClose, onTerritoryCreated, territory = null }) => {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const totalSteps = 6
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    zipCodes: [],
    radiusMiles: 25,
    timezone: "America/New_York",
    status: "active",
    businessHours: {},
    teamMembers: [],
    services: [],
    pricingMultiplier: 1.00
  })
  
  // Available options
  const [availableServices, setAvailableServices] = useState([])
  const [availableTeamMembers, setAvailableTeamMembers] = useState([])
  const [timezones] = useState([
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "America/Anchorage", label: "Alaska Time" },
    { value: "Pacific/Honolulu", label: "Hawaii Time" }
  ])

  useEffect(() => {
    if (isOpen) {
      if (territory) {
        // Edit mode - populate form with existing data
        setFormData({
          name: territory.name || "",
          description: territory.description || "",
          location: territory.location || "",
          zipCodes: territory.zip_codes || [],
          radiusMiles: territory.radius_miles || 25,
          timezone: territory.timezone || "America/New_York",
          status: territory.status || "active",
          businessHours: territory.business_hours || {},
          teamMembers: territory.team_members || [],
          services: territory.services || [],
          pricingMultiplier: territory.pricing_multiplier || 1.00
        })
      } else {
        // Create mode - reset form
        setFormData({
          name: "",
          description: "",
          location: "",
          zipCodes: [],
          radiusMiles: 25,
          timezone: "America/New_York",
          status: "active",
          businessHours: {},
          teamMembers: [],
          services: [],
          pricingMultiplier: 1.00
        })
      }
      loadOptions()
    }
  }, [isOpen, territory])

  const loadOptions = async () => {
    if (!user?.id) return
    
    try {
      // Load services
      const servicesResponse = await servicesAPI.getAll(user.id)
      setAvailableServices(servicesResponse || [])
      
      // Load team members
      const teamResponse = await teamAPI.getAll(user.id)
      setAvailableTeamMembers(teamResponse.teamMembers || [])
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      const territoryData = {
        userId: user.id,
        ...formData
      }
      
      if (territory) {
        // Update existing territory
        await territoriesAPI.update(territory.id, territoryData)
      } else {
        // Create new territory
        await territoriesAPI.create(territoryData)
      }
      
      onTerritoryCreated()
      onClose()
    } catch (error) {
      console.error('Error saving territory:', error)
      setError('Failed to save territory. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {territory ? 'Edit Territory' : 'Create a Service Territory'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['Basic Info', 'Location', 'Team', 'Services', 'Pricing', 'Review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step > index + 1 ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {stepName}
                </span>
                {index < 5 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                  Territory name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Downtown Area, North Region"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this territory..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-900">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-900">
                  Territory location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter a location or address"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="radius" className="block text-sm font-medium text-gray-900">
                  Service radius (miles)
                </label>
                <input
                  type="number"
                  id="radius"
                  value={formData.radiusMiles}
                  onChange={(e) => handleInputChange('radiusMiles', parseFloat(e.target.value))}
                  min="1"
                  max="100"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-900">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Team Members */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Assign team members
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTeamMembers.map(member => (
                    <label key={member.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.teamMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('teamMembers', [...formData.teamMembers, member.id])
                          } else {
                            handleInputChange('teamMembers', formData.teamMembers.filter(id => id !== member.id))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {member.first_name} {member.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Services */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Available services
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableServices.map(service => (
                    <label key={service.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('services', [...formData.services, service.id])
                          } else {
                            handleInputChange('services', formData.services.filter(id => id !== service.id))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{service.name}</span>
                      <span className="text-sm text-gray-500">${service.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Pricing */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pricingMultiplier" className="block text-sm font-medium text-gray-900">
                  Price multiplier
                </label>
                <input
                  type="number"
                  id="pricingMultiplier"
                  value={formData.pricingMultiplier}
                  onChange={(e) => handleInputChange('pricingMultiplier', parseFloat(e.target.value))}
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600">
                  Multiply base service prices by this factor for this territory
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Territory Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{formData.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Radius:</span>
                    <span className="ml-2 font-medium">{formData.radiusMiles} miles</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Team Members:</span>
                    <span className="ml-2 font-medium">{formData.teamMembers.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Services:</span>
                    <span className="ml-2 font-medium">{formData.services.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price Multiplier:</span>
                    <span className="ml-2 font-medium">{formData.pricingMultiplier}x</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Step {step} of {totalSteps}
          </div>
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1 inline" />
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1 inline" />
              </button>
            ) : (
              <LoadingButton
                onClick={handleSubmit}
                loading={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {territory ? 'Update Territory' : 'Create Territory'}
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTerritoryModal 