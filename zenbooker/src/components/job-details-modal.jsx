"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, MapPin, Users, Edit, Save, Check, AlertCircle } from "lucide-react"
import { jobsAPI, teamAPI } from "../services/api"
import { formatPhoneNumber } from "../utils/phoneFormatter"

const JobDetailsModal = ({ isOpen, onClose, job, onJobUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [teamMembers, setTeamMembers] = useState([])
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)

  // Form data for editing
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
    status: "",
    teamMemberId: ""
  })

  useEffect(() => {
    if (job) {
      // Parse scheduled date and time
      const scheduledDate = new Date(job.scheduled_date)
      const dateStr = scheduledDate.toISOString().split('T')[0]
      const timeStr = scheduledDate.toTimeString().slice(0, 5)
      
      setFormData({
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        notes: job.notes || "",
        status: job.status,
        teamMemberId: job.team_member_id || ""
      })
    }
  }, [job])

  useEffect(() => {
    if (isOpen && job) {
      loadTeamMembers()
    }
  }, [isOpen, job])

  const loadTeamMembers = async () => {
    try {
      const members = await teamAPI.getAll(job.user_id)
      // Handle both array and object with teamMembers property
      const teamMembersArray = Array.isArray(members) ? members : (members?.teamMembers || members || [])
      setTeamMembers(teamMembersArray)
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")
      
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      
      const updateData = {
        scheduled_date: scheduledDateTime.toISOString(),
        notes: formData.notes,
        status: formData.status
      }
      
      // If team member assignment changed, assign the job
      if (formData.teamMemberId !== job.team_member_id) {
        if (formData.teamMemberId) {
          await jobsAPI.assignToTeamMember(job.id, formData.teamMemberId)
        } else {
          // Remove assignment
          await jobsAPI.assignToTeamMember(job.id, null)
        }
      }
      
      await jobsAPI.update(job.id, updateData)
      
      setSuccessMessage("Job updated successfully!")
      setTimeout(() => {
        onJobUpdate()
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Error updating job:', error)
      setError("Failed to update job. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true)
      await jobsAPI.updateStatus(job.id, newStatus)
      setFormData(prev => ({ ...prev, status: newStatus }))
      
      if (onJobUpdate) {
        onJobUpdate()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setError("Failed to update status.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getSelectedTeamMember = () => {
    return teamMembers.find(member => member.id === formData.teamMemberId)
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {job.service_name} • {job.customer_first_name} {job.customer_last_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            {editing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
                <div className="flex space-x-1">
                  {['pending', 'confirmed', 'in_progress', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading || job.status === status}
                      className={`px-2 py-1 text-xs rounded ${
                        job.status === status 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{job.customer_first_name} {job.customer_last_name}</span>
              </div>
              {job.customer_email && (
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm">{job.customer_email}</span>
                </div>
              )}
              {job.customer_phone && (
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm">{formatPhoneNumber(job.customer_phone)}</span>
                </div>
              )}
              {job.customer_address && (
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm">
                    {job.customer_address}
                    {job.customer_suite && `, ${job.customer_suite}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Service Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service:</span>
                <span className="text-sm font-medium">{job.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm">${job.service_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm">{job.service_duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Scheduling</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(job.scheduled_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  {editing ? (
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Team Assignment</h3>
            {editing ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between"
                >
                  <span className={getSelectedTeamMember() ? "text-gray-900" : "text-gray-500"}>
                    {getSelectedTeamMember() 
                      ? `${getSelectedTeamMember().first_name} ${getSelectedTeamMember().last_name}`
                      : "Select team member..."
                    }
                  </span>
                  <Users className="w-4 h-4 text-gray-400" />
                </button>

                {showTeamDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, teamMemberId: "" }))
                        setShowTeamDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100"
                    >
                      <div className="font-medium">Unassigned</div>
                    </button>
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, teamMemberId: member.id }))
                          setShowTeamDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{member.first_name} {member.last_name}</div>
                        <div className="text-sm text-gray-500">{member.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span>
                  {job.team_member_first_name 
                    ? `${job.team_member_first_name} ${job.team_member_last_name}`
                    : "Unassigned"
                  }
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            {editing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Add notes about this job..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {job.notes || "No notes added"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsModal 