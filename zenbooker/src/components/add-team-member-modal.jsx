"use client"

import { X } from "lucide-react"
import { useState } from "react"

const AddTeamMemberModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobilePhone: "",
    startLocation: "",
    isServiceProvider: true,
    role: "worker",
    permissions: {
      editAvailability: true,
      viewContactInfo: true,
      markJobStatus: true,
      editJobDetails: true,
      resetJobStatus: false,
      viewEditPrice: false,
      processPayments: false,
      rescheduleJobs: true
    }
  })

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl relative mt-16 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                An email will be sent with instructions to log into their Zenbooker account.
              </p>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                placeholder="Optional"
                value={formData.mobilePhone}
                onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Service providers can be notified via SMS when new jobs are assigned to them
              </p>
            </div>

            {/* Start Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Location
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={formData.startLocation}
                onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The location this team member starts work from
              </p>
            </div>

            {/* Service Provider Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Provider</label>
                  <p className="text-xs text-gray-500">Can this team member be assigned to jobs?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isServiceProvider: !formData.isServiceProvider })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.isServiceProvider ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isServiceProvider ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* User Role and Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                User Role and Permissions
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="worker"
                    checked={formData.role === "worker"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Worker
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="scheduler"
                    checked={formData.role === "scheduler"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Scheduler
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={formData.role === "manager"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Manager
                  </label>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.editAvailability}
                    onChange={() => handlePermissionChange("editAvailability")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Edit their own availability
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewContactInfo}
                    onChange={() => handlePermissionChange("viewContactInfo")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    View contact info and notes for customer
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.markJobStatus}
                    onChange={() => handlePermissionChange("markJobStatus")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Mark jobs as 'en-route', 'in-progress' & 'complete'
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.editJobDetails}
                    onChange={() => handlePermissionChange("editJobDetails")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Edit job details
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.resetJobStatus}
                    onChange={() => handlePermissionChange("resetJobStatus")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Reset job statuses
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewEditPrice}
                    onChange={() => handlePermissionChange("viewEditPrice")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    View & edit job price, invoice, and line items
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.processPayments}
                    onChange={() => handlePermissionChange("processPayments")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Process payments and mark jobs as paid
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.rescheduleJobs}
                    onChange={() => handlePermissionChange("rescheduleJobs")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    Reschedule jobs
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTeamMemberModal 