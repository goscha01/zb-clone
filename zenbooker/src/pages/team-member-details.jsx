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
  Trash2
} from "lucide-react"
import { teamAPI } from "../services/api"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"

const TeamMemberDetails = () => {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [teamMember, setTeamMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workingHours, setWorkingHours] = useState({
    sunday: { available: false, hours: "" },
    monday: { available: true, hours: "9:00 AM - 6:00 PM" },
    tuesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    wednesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    thursday: { available: true, hours: "9:00 AM - 6:00 PM" },
    friday: { available: true, hours: "9:00 AM - 6:00 PM" },
    saturday: { available: false, hours: "" }
  })

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
          setWorkingHours(availability)
        } catch (e) {
          console.log('Could not parse availability:', e)
        }
      }
      
    } catch (error) {
      console.error('Error fetching team member details:', error)
      setError("Failed to load team member details.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditMember = () => {
    navigate(`/team/${memberId}/edit`)
  }

  const handleDeleteMember = async () => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return
    }
    
    try {
      await teamAPI.delete(memberId)
      navigate('/team')
    } catch (error) {
      console.error('Error deleting team member:', error)
      setError("Failed to delete team member.")
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/team")}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    All Team Members
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Member Details</h1>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
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
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleEditMember}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={handleDeleteMember}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Mobile phone</label>
                        <p className="mt-1 text-sm text-gray-900">{teamMember.phone || 'No phone number'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{teamMember.email}</p>
                      </div>
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

                    {teamMember.skills && (
                      <div>
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
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{job.service_name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {job.customer_first_name} {job.customer_last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(job.scheduled_date).toLocaleDateString()}
                          </p>
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
                      for specific dates. <button className="text-blue-600 hover:text-blue-700">Learn more...</button>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Recurring Hours */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <h5 className="text-sm font-medium text-gray-900">RECURRING HOURS</h5>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="space-y-4">
                        {Object.entries(workingHours).map(([day, { available, hours }]) => (
                          <div key={day} className="flex justify-between items-center">
                            <span className="text-sm text-gray-900 capitalize">{day}</span>
                            <span className="text-sm text-gray-500">{available ? hours : "Unavailable"}</span>
                          </div>
                        ))}
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Edit Hours
                        </button>
                      </div>
                    </div>

                    {/* Custom Availability */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <h5 className="text-sm font-medium text-gray-900">CUSTOM AVAILABILITY</h5>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-4">Add a date override</p>
                        <p className="text-xs text-gray-500 mb-4">Customize this provider's availability for specific dates.</p>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Add Date Override
                        </button>
                      </div>
                    </div>
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

export default TeamMemberDetails 