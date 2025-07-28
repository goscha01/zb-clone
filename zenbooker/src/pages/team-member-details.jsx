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
import { territoriesAPI } from "../services/api"

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
  const [territoryLoading, setTerritoryLoading] = useState(false)

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

  // Map territory IDs to full territory objects when available territories load
  useEffect(() => {
    if (availableTerritories.length > 0 && territories.length > 0) {
      const mappedTerritories = territories.map(territory => {
        if (typeof territory === 'object' && territory.id && !territory.name) {
          // This is a territory ID object, find the full territory
          const fullTerritory = availableTerritories.find(t => t.id === territory.id)
          return fullTerritory || territory
        }
        return territory
      })
      
      // Only update if the mapping actually changed something
      const hasChanges = mappedTerritories.some((t, i) => 
        t.name && territories[i] && !territories[i].name
      )
      
      if (hasChanges) {
        console.log('Mapping territories:', mappedTerritories)
        setTerritories(mappedTerritories)
      }
    }
  }, [availableTerritories, territories])

  const fetchTeamMemberDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('Fetching team member details for ID:', memberId)
      
      if (!memberId) {
        throw new Error('No team member ID provided')
      }
      
      const response = await teamAPI.getById(memberId)
      console.log('Team member response:', response)
      
      if (!response) {
        throw new Error('No response from API')
      }
      
      // The API returns { teamMember, jobs } structure
      const teamMemberData = response.teamMember || response
      
      if (!teamMemberData) {
        throw new Error('No team member data in response')
      }
      
      console.log('Setting team member data:', teamMemberData)
      setTeamMember(teamMemberData)
      
      // Parse availability if it exists
      if (teamMemberData.availability) {
        try {
          const availability = JSON.parse(teamMemberData.availability)
          setWorkingHours(availability.workingHours || workingHours)
          setCustomAvailability(availability.customAvailability || [])
        } catch (e) {
          console.log('Could not parse availability:', e)
        }
      }
      
      // Parse territories if they exist
      if (teamMemberData.territories) {
        try {
          const territoriesData = JSON.parse(teamMemberData.territories)
          console.log('Parsed territories data:', territoriesData)
          
          // If territoriesData is an array of IDs, we need to map them to full territory objects
          if (Array.isArray(territoriesData)) {
            // For now, set the IDs - we'll map to full objects after availableTerritories loads
            setTerritories(territoriesData.map(id => ({ id })))
          } else {
            setTerritories(territoriesData)
          }
        } catch (e) {
          console.log('Could not parse territories:', e)
        }
      }
    } catch (error) {
      console.error('Error fetching team member details:', error)
      setError(`Failed to load team member details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchTerritories = async () => {
    try {
      setTerritoryLoading(true)
      console.log('Fetching available territories for user:', user?.id)
      const response = await territoriesAPI.getAll(user?.id, { status: 'active' })
      console.log('Territories response:', response)
      setAvailableTerritories(response.territories || [])
    } catch (error) {
      console.error('Error fetching territories:', error)
      setAvailableTerritories([])
    } finally {
      setTerritoryLoading(false)
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

  const handleAddTerritory = async (territoryId) => {
    try {
      setTerritoryLoading(true)
      const territory = availableTerritories.find(t => t.id === territoryId)
      if (territory && !territories.find(t => t.id === territoryId)) {
        const updatedTerritories = [...territories, territory]
        setTerritories(updatedTerritories)
        
        // Save to backend
        await teamAPI.update(memberId, {
          territories: JSON.stringify(updatedTerritories.map(t => t.id))
        })
      }
    } catch (error) {
      console.error('Error adding territory:', error)
      setError("Failed to add territory. Please try again.")
    } finally {
      setTerritoryLoading(false)
    }
  }

  const handleRemoveTerritory = async (territoryId) => {
    try {
      setTerritoryLoading(true)
      const updatedTerritories = territories.filter(t => t.id !== territoryId)
      setTerritories(updatedTerritories)
      
      // Save to backend
      await teamAPI.update(memberId, {
        territories: JSON.stringify(updatedTerritories.map(t => t.id))
      })
    } catch (error) {
      console.error('Error removing territory:', error)
      setError("Failed to remove territory. Please try again.")
    } finally {
      setTerritoryLoading(false)
    }
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
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {teamMember.first_name?.charAt(0)}{teamMember.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
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
                      <p className="mt-1 text-sm text-gray-900 break-all">{teamMember.email}</p>
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
                            : teamMember.status === 'invited'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teamMember.status === 'active' ? 'Active' : 
                           teamMember.status === 'invited' ? 'Invited' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Role</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{teamMember.role || 'Team Member'}</p>
                    </div>
                    {teamMember.hourly_rate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Hourly Rate</label>
                        <p className="mt-1 text-sm text-gray-900">${teamMember.hourly_rate}/hour</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Territories Card */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">Territories</h3>
                      {territoryLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    <select 
                      onChange={(e) => {
                        const territoryId = parseInt(e.target.value)
                        if (territoryId) {
                          handleAddTerritory(territoryId)
                          e.target.value = "" // Reset dropdown
                        }
                      }}
                      disabled={territoryLoading}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      defaultValue=""
                    >
                      <option value="" disabled>Add Territory</option>
                      {availableTerritories
                        .filter(t => !territories.find(ct => ct.id === t.id))
                        .map(territory => (
                          <option key={territory.id} value={territory.id}>
                            {territory.name} {territory.location ? `- ${territory.location}` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {territoryLoading ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading available territories...</p>
                    </div>
                  ) : (
                    territories.length === 0 ? (
                      <div className="text-center py-6">
                        <MapPinIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No territories assigned</p>
                        <p className="text-xs text-gray-400 mt-1">Add territories to assign this team member to specific service areas</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {console.log('Rendering territories:', territories)}
                        {territories.map(territory => {
                          console.log('Territory object:', territory)
                          return (
                            <div key={territory.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <MapPinIcon className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {territory.name || `Territory ${territory.id}`}
                                  </p>
                                  {territory.location && (
                                    <p className="text-sm text-gray-500">{territory.location}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveTerritory(territory.id)}
                                disabled={territoryLoading}
                                className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove territory"
                              >
                                {territoryLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )
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