"use client"

import { useState } from "react"
import { X, MapPin } from "lucide-react"

const CreateTerritoryModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1)
  const totalSteps = 6

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create a Service Territory</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Territory Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-900">
              Territory location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                placeholder="Enter a location or address"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-sm text-gray-600">Enter an address or central location for this territory</p>
          </div>

          {/* Territory Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Territory name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Territory name"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-600">You'll see this name in other parts of your account</p>
          </div>

          {/* Territory Timezone */}
          <div className="space-y-2">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-900">
              Territory timezone
            </label>
            <input
              type="text"
              id="timezone"
              placeholder="Timezone"
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-sm text-gray-600">The timezone is set automatically based on the territory's location</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Step {step} of {totalSteps}
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTerritoryModal 