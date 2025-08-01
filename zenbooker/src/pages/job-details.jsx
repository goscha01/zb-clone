import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  PauseCircle,
  AlertCircle,
  Check,
  DollarSign,
  User,
  Building
} from "lucide-react"
import { jobsAPI, teamAPI, invoicesAPI, notificationAPI, territoriesAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { formatPhoneNumber } from "../utils/phoneFormatter"

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [teamMembers, setTeamMembers] = useState([])
  const [territories, setTerritories] = useState([])
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const [showTerritoryDropdown, setShowTerritoryDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [smsNotifications, setSmsNotifications] = useState(true)

  const handleNotificationToggle = async (type, value) => {
    try {
      if (type === 'email') {
        setEmailNotifications(value)
      } else if (type === 'sms') {
        setSmsNotifications(value)
      }
      
      // Save notification preferences to backend
      await notificationAPI.updatePreferences(job.customer_id, {
        email_notifications: type === 'email' ? value : emailNotifications,
        sms_notifications: type === 'sms' ? value : smsNotifications
      })
      
      console.log(`${type} notifications:`, value ? 'enabled' : 'disabled')
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      // Revert the toggle if the API call failed
      if (type === 'email') {
        setEmailNotifications(!value)
      } else if (type === 'sms') {
        setSmsNotifications(!value)
      }
    }
  }

  // Form data for editing
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
    status: "",
    teamMemberId: "",
    territoryId: ""
  })

  const loadNotificationPreferences = async () => {
    try {
      const preferences = await notificationAPI.getPreferences(job.customer_id)
      setEmailNotifications(preferences.email_notifications || false)
      setSmsNotifications(preferences.sms_notifications || true)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  useEffect(() => {
    if (!authLoading && user?.id && jobId) {
      fetchJobDetails()
      loadTeamMembers()
      loadTerritories()
    } else if (!authLoading && !user?.id) {
      navigate('/signin')
    }
  }, [jobId, user?.id, authLoading])

  useEffect(() => {
    if (job?.customer_id) {
      loadNotificationPreferences()
    }
  }, [job?.customer_id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await jobsAPI.getById(jobId)
      console.log('Job details response:', response)
      console.log('Territory data:', {
        territory_name: response.territory_name,
        territory_location: response.territory_location,
        territory_zip_codes: response.territory_zip_codes,
        territory_id: response.territory_id
      })
      setJob(response.job || response)
      
      // Parse scheduled date and time for form
      if (response.job || response) {
        const jobData = response.job || response
        const scheduledDate = new Date(jobData.scheduled_date)
        const dateStr = scheduledDate.toISOString().split('T')[0]
        const timeStr = scheduledDate.toTimeString().slice(0, 5)
        
        setFormData({
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          notes: jobData.notes || "",
          status: jobData.status,
          teamMemberId: jobData.team_member_id || "",
          territoryId: jobData.territory_id || ""
        })
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      setError("Failed to load job details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    try {
      const members = await teamAPI.getAll(user.id)
      const teamMembersArray = Array.isArray(members) ? members : (members?.teamMembers || members || [])
      setTeamMembers(teamMembersArray)
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  const loadTerritories = async () => {
    try {
      console.log('Loading territories for user:', user.id)
      const response = await territoriesAPI.getAll(user.id, { status: 'active' })
      console.log('Territories response:', response)
      console.log('Available territories:', response.territories || [])
      setTerritories(response.territories || [])
    } catch (error) {
      console.error('Error loading territories:', error)
      setTerritories([])
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccessMessage("")
      
      console.log('Saving job with formData:', formData)
      
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      
      const updateData = {
        scheduled_date: scheduledDateTime.toISOString(),
        notes: formData.notes,
        status: formData.status,
        territoryId: formData.territoryId
      }
      
      console.log('Update data being sent:', updateData)
      
      // If team member assignment changed, assign the job
      if (formData.teamMemberId !== job.team_member_id) {
        if (formData.teamMemberId) {
          await jobsAPI.assignToTeamMember(job.id, formData.teamMemberId)
        } else {
          // Remove assignment
          await jobsAPI.assignToTeamMember(job.id, null)
        }
      }
      
      const result = await jobsAPI.update(job.id, updateData)
      console.log('Job update result:', result)
      
      setSuccessMessage("Job updated successfully!")
      setEditing(false)
      
      // Update the job state immediately with the new notes
      setJob(prev => ({
        ...prev,
        notes: formData.notes,
        status: formData.status,
        scheduled_date: scheduledDateTime.toISOString()
      }))
      
      // Refresh job data
      await fetchJobDetails()
      
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      
    } catch (error) {
      console.error('Error updating job:', error)
      setError("Failed to update job. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setSaving(true)
      await jobsAPI.updateStatus(job.id, newStatus)
      setFormData(prev => ({ ...prev, status: newStatus }))
      setJob(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error('Error updating status:', error)
      setError("Failed to update status.")
    } finally {
      setSaving(false)
    }
  }

  const handleAssignJob = (job) => {
    // Open team member assignment modal or navigate to assignment page
    setEditing(true) // Enable editing mode to show team member dropdown
  }

  const handleSendInvoice = async (job) => {
    try {
      setSaving(true)
      // Create invoice for the job using the proper API
      const invoiceData = {
        userId: user.id,
        customerId: job.customer_id,
        jobId: job.id,
        totalAmount: job.total_amount || job.service_price,
        status: 'sent'
      }
      
      await invoicesAPI.create(invoiceData)
      
      // Refresh job data to get updated invoice status
      await fetchJobDetails()
      setSuccessMessage('Invoice created and sent successfully!')
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error('Error sending invoice:', error)
      setError('Error sending invoice. Please try again.')
    } finally {
      setSaving(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <PlayCircle className="w-4 h-4" />
      case 'confirmed': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'pending': return <PauseCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSelectedTeamMember = () => {
    return teamMembers.find(member => member.id === formData.teamMemberId)
  }

  const getSelectedTerritory = () => {
    return territories.find(territory => territory.id === formData.territoryId)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading job details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Job</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
              <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/jobs')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-semibold text-gray-900">Job Details</h1>
              <p className="text-sm text-gray-600">
                {job.service_name} • {job.customer_first_name} {job.customer_last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Job</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/jobs')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-display font-semibold text-gray-900">Job Details</h1>
                <p className="text-sm text-gray-600">
                  {job.service_name} • {job.customer_first_name} {job.customer_last_name}
                </p>
              </div>
            </div>
            {editing ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{getStatusLabel(job.status)}</span>
                      </span>
                    </div>
                    {!editing && (
                      <div className="flex space-x-2">
                        {['pending', 'confirmed', 'in_progress', 'completed'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={saving || job.status === status}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              job.status === status 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{job.customer_first_name} {job.customer_last_name}</p>
                      </div>
                    </div>
                    {job.customer_email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{job.customer_email}</p>
                        </div>
                      </div>
                    )}
                    {job.customer_phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{formatPhoneNumber(job.customer_phone)}</p>
                        </div>
                      </div>
                    )}
                    {job.customer_address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">
                            {job.customer_address}
                            {job.customer_suite && `, ${job.customer_suite}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-medium">{job.service_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">{formatCurrency(job.service_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{job.service_duration} minutes</p>
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h2>
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
                          <span>{formatDate(job.scheduled_date)}</span>
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
                          <span>{formatTime(job.scheduled_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Assignment */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Assignment</h2>
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
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned To</p>
                        <p className="font-medium">
                          {job.team_member_first_name 
                            ? `${job.team_member_first_name} ${job.team_member_last_name}`
                            : "Unassigned"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Territories */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Territories</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Assign Territory
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTerritoryDropdown(!showTerritoryDropdown)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between"
                      >
                        <span className={getSelectedTerritory() ? "text-gray-900" : "text-gray-500"}>
                          {getSelectedTerritory() 
                            ? getSelectedTerritory().name
                            : "Select territory..."
                          }
                        </span>
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </button>

                      {showTerritoryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, territoryId: "" }))
                              setShowTerritoryDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="font-medium">No Territory</div>
                          </button>
                          {territories.length > 0 ? (
                            territories.map((territory) => (
                              <button
                                key={territory.id}
                                type="button"
                                onClick={() => {
                                  console.log('Selected territory:', territory)
                                  setFormData(prev => ({ ...prev, territoryId: territory.id }))
                                  setShowTerritoryDropdown(false)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{territory.name}</div>
                                <div className="text-sm text-gray-500">{territory.location}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No territories available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {job.territory_name ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Service Territory</p>
                              <p className="font-medium">{job.territory_name}</p>
                              {job.territory_location && (
                                <p className="text-sm text-gray-500">{job.territory_location}</p>
                              )}
                              {job.territory_zip_codes && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-500">Coverage Areas:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {JSON.parse(job.territory_zip_codes || '[]').map((zipCode, index) => (
                                      <span 
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {zipCode}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setEditing(true)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Change Territory
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No territory assigned</p>
                          <p className="text-xs text-gray-400 mt-1">This job is not assigned to a specific service territory</p>
                          <button
                            onClick={() => setEditing(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Assign Territory
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Notifications */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Notifications</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">NOTIFICATION PREFERENCES</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Emails</span>
                          <button
                            onClick={() => handleNotificationToggle('email', !emailNotifications)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${
                              emailNotifications ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              emailNotifications ? 'right-0.5' : 'left-0.5'
                            }`}></div>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Text messages</span>
                          <button
                            onClick={() => handleNotificationToggle('sms', !smsNotifications)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${
                              smsNotifications ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              smsNotifications ? 'right-0.5' : 'left-0.5'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Recent notifications commented out for now
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">RECENT NOTIFICATIONS</h3>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">En Route</div>
                          <div className="text-gray-500">11 hours ago - SMS - Sent</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">Reminder</div>
                          <div className="text-gray-500">a day ago - SMS - Sent</div>
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                </div>

                {/* Job Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAssignJob(job)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Assign Job
                    </button>
                    <button
                      onClick={() => handleSendInvoice(job)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Send Invoice
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                  {editing ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={6}
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

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Job Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Job ID</span>
                      <span className="text-sm font-medium">#{job.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Amount</span>
                      <span className="text-sm font-medium">{formatCurrency(job.total_amount || job.service_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">{formatDate(job.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm font-medium">{formatDate(job.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAssignJob(job)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>Assign Job</span>
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendInvoice(job)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>Send Invoice</span>
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/customer/${job.customer_id}`)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>View Customer</span>
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/services/${job.service_id}`)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>View Service</span>
                      <Building className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>Print Job</span>
                      <FileText className="w-4 h-4" />
                    </button>
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

export default JobDetails 