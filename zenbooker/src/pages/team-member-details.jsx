"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ChevronLeft, 
  HelpCircle, 
  Clock, 
  AlertCircle, 
  Mail, 
  MessageSquare,
  Calendar,
  Tag as TagIcon,
  Phone,
  MapPin,
  User,
  Edit,
  Trash2,
  X,
  Save,
  Plus,
  MapPin as MapPinIcon
} from "lucide-react"
import { teamAPI } from "../services/api"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import AddTeamMemberModal from "../components/add-team-member-modal"
import { useAuth } from "../context/AuthContext"

const TeamMemberDetails = () => {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teamMember, setTeamMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editingHours, setEditingHours] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState(false)
  const [workingHours, setWorkingHours] = useState({
    sunday: { available: false, hours: "" },
    monday: { available: true, hours: "9:00 AM - 6:00 PM" },
    tuesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    wednesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    thursday: { available: true, hours: "9:00 AM - 6:00 PM" },
    friday: { available: true, hours: "9:00 AM - 6:00 PM" },
    saturday: { available: false, hours: "" }
  })
  const [customAvailability, setCustomAvailability] = useState([])
  const [territories, setTerritories] = useState([])
  const [availableTerritories, setAvailableTerritories] = useState([])

  const [settings, setSettings] = useState({
    isServiceProvider: true,
    canEditAvailability: true,
    limitJobsPerDay: false,
    canAutoAssign: true,
    canClaimJobs: true,
    emailNotifications: true,
    smsNotifications: false
  })

  useEffect(() => {
    if (memberId) {
      fetchTeamMemberDetails()
      fetchTerritories()
    }
  }, [memberId])

  const fetchTeamMemberDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await teamAPI.getById(memberId)
      setTeamMember(response)
      
      // Parse availability if it exists
      if (response.availability) {
        try {
          const availability = JSON.parse(response.availability)
          setWorkingHours(availability.workingHours || workingHours)
          setCustomAvailability(availability.customAvailability || [])
        } catch (e) {
          console.log('Could not parse availability:', e)
        }
      }
      
      // Parse territories if they exist
      if (response.territories) {
        try {
          const territoriesData = JSON.parse(response.territories)
          setTerritories(territoriesData)
        } catch (e) {
          console.log('Could not parse territories:', e)
        }
      }
      
    } catch (error) {
      console.error('Error fetching team member details:', error)
      setError("Failed to load team member details.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTerritories = async () => {
    try {
      // This would fetch available territories from your API
      // For now, using mock data
      setAvailableTerritories([
        { id: 1, name: "Downtown Area", city: "New York" },
        { id: 2, name: "Uptown District", city: "New York" },
        { id: 3, name: "Brooklyn Heights", city: "Brooklyn" },
        { id: 4, name: "Queens Central", city: "Queens" }
      ])
    } catch (error) {
      console.error('Error fetching territories:', error)
    }
  }

  const handleEditMember = () => {
    setShowEditModal(true)
  }

  const handleDeleteMember = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteMember = async () => {
    try {
      setDeleteLoading(true)
      await teamAPI.delete(memberId)
      navigate('/team')
    } catch (error) {
      console.error('Error deleting team member:', error)
      setError("Failed to delete team member.")
      setShowDeleteModal(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveHours = async () => {
    try {
      const availabilityData = {
        workingHours,
        customAvailability
      }
      
      await teamAPI.update(memberId, {
        availability: JSON.stringify(availabilityData)
      })
      
      setEditingHours(false)
      // Show success message
    } catch (error) {
      console.error('Error saving hours:', error)
      setError("Failed to save availability.")
    }
  }

  const handleAddCustomAvailability = () => {
    setCustomAvailability([
      ...customAvailability,
      {
        id: Date.now(),
        date: '',
        available: true,
        hours: ''
      }
    ])
  }

  const handleRemoveCustomAvailability = (id) => {
    setCustomAvailability(customAvailability.filter(item => item.id !== id))
  }

  const handleAddTerritory = (territoryId) => {
    const territory = availableTerritories.find(t => t.id === territoryId)
    if (territory && !territories.find(t => t.id === territoryId)) {
      setTerritories([...territories, territory])
    }
  }

  const handleRemoveTerritory = (territoryId) => {
    setTerritories(territories.filter(t => t.id !== territoryId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team member details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/team')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Team
          </button>
        </div>
      </div>
    )
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Team member not found</p>
          <button 
            onClick={() => navigate('/team')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Team
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/team")}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    All Team Members
                  </button>
                  <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Member Details</h1>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button 
                    onClick={handleEditMember}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button 
                    onClick={handleDeleteMember}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {teamMember.first_name?.charAt(0)}{teamMember.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {teamMember.first_name} {teamMember.last_name}
                        </h2>
                        <p className="text-sm text-gray-500">{teamMember.role || 'Team Member'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Mobile phone</label>
                      <p className="mt-1 text-sm text-gray-900">{teamMember.phone || 'No phone number'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{teamMember.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{teamMember.username || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teamMember.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teamMember.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Role</label>
                      <p className="mt-1 text-sm text-gray-900">{teamMember.role || 'Team Member'}</p>
                    </div>
                    {teamMember.hourly_rate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Hourly Rate</label>
                        <p className="mt-1 text-sm text-gray-900">${teamMember.hourly_rate}/hour</p>
                      </div>
                    )}
                  </div>

                  {teamMember.skills && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-500">Skills</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {JSON.parse(teamMember.skills || '[]').map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Territories Card */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">Territories</h3>
                    </div>
                    <select 
                      onChange={(e) => handleAddTerritory(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Add Territory</option>
                      {availableTerritories
                        .filter(t => !territories.find(ct => ct.id === t.id))
                        .map(territory => (
                          <option key={territory.id} value={territory.id}>
                            {territory.name} - {territory.city}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {territories.length === 0 ? (
                    <p className="text-sm text-gray-500">No territories assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {territories.map(territory => (
                        <div key={territory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{territory.name}</p>
                            <p className="text-sm text-gray-500">{territory.city}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveTerritory(territory.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Jobs Card */}
              {teamMember.recentJobs && teamMember.recentJobs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {teamMember.recentJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div>
                              <h4 className="font-medium text-gray-900">{job.service_name}</h4>
                              <p className="text-sm text-gray-600">
                                {job.customer_first_name} {job.customer_last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(job.scheduled_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Provider Card */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Service Provider</h3>
                      <p className="text-sm text-gray-500">This team member can be assigned to jobs</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.isServiceProvider ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => setSettings(s => ({ ...s, isServiceProvider: !s.isServiceProvider }))}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.isServiceProvider ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="border-t border-gray-200 p-6">
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-900">Availability</h4>
                    <p className="text-sm text-gray-500">
                      Manage this team member's availability by editing their regular work hours, or by adding custom availability
                      for specific dates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recurring Hours */}
                    <div>
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <h5 className="text-sm font-medium text-gray-900">RECURRING HOURS</h5>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        {!editingHours ? (
                          <button
                            onClick={() => setEditingHours(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit Hours
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveHours}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingHours(false)}
                              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {Object.entries(workingHours).map(([day, { available, hours }]) => (
                          <div key={day} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <span className="text-sm text-gray-900 capitalize">{day}</span>
                            {editingHours ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={available}
                                  onChange={(e) => setWorkingHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], available: e.target.checked }
                                  }))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={hours}
                                  onChange={(e) => setWorkingHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], hours: e.target.value }
                                  }))}
                                  placeholder="9:00 AM - 6:00 PM"
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">{available ? hours : "Unavailable"}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Availability */}
                    <div>
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <h5 className="text-sm font-medium text-gray-900">CUSTOM AVAILABILITY</h5>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        {!editingAvailability ? (
                          <button
                            onClick={() => setEditingAvailability(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Add Date Override
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingAvailability(false)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {editingAvailability && (
                        <div className="mb-4">
                          <button
                            onClick={handleAddCustomAvailability}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Custom Date
                          </button>
                        </div>
                      )}
                      
                      {customAvailability.length === 0 ? (
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-4">No custom availability set</p>
                          <p className="text-xs text-gray-500 mb-4">Customize this provider's availability for specific dates.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customAvailability.map((item) => (
                            <div key={item.id} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                <input
                                  type="date"
                                  value={item.date}
                                  onChange={(e) => setCustomAvailability(prev => 
                                    prev.map(i => i.id === item.id ? { ...i, date: e.target.value } : i)
                                  )}
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <input
                                  type="text"
                                  value={item.hours}
                                  onChange={(e) => setCustomAvailability(prev => 
                                    prev.map(i => i.id === item.id ? { ...i, hours: e.target.value } : i)
                                  )}
                                  placeholder="9:00 AM - 6:00 PM"
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              </div>
                              {editingAvailability && (
                                <button
                                  onClick={() => handleRemoveCustomAvailability(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Team Member</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {teamMember.first_name} {teamMember.last_name}? This action cannot be undone.
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMember}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      <AddTeamMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false)
          fetchTeamMemberDetails() // Refresh the data
        }}
        userId={user?.id}
        member={teamMember}
        isEditing={true}
      />
    </div>
  )
}

export default TeamMemberDetails 