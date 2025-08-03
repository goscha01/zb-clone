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
  Building,
  ChevronDown,
  ChevronUp,
  Settings,
  CreditCard,
  Truck,
  Clipboard,
  Home,
  Plus,
  Tag
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
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)

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
    territoryId: "",
    skills: []
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
    if (job) {
      setFormData({
        scheduledDate: job.scheduled_date ? job.scheduled_date.split('T')[0] : "",
        scheduledTime: job.scheduled_date ? job.scheduled_date.split('T')[1]?.substring(0, 5) : "",
        notes: job.notes || "",
        status: job.status || "",
        teamMemberId: job.team_member_id || "",
        territoryId: job.territory_id || "",
        skills: job.skills ? JSON.parse(job.skills) : []
      })
      // Parse skills from job data
      try {
        if (job.skills) {
          const parsedSkills = typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills
          setSelectedSkills(Array.isArray(parsedSkills) ? parsedSkills : [])
          console.log('Loaded skills from job:', parsedSkills)
        } else {
          setSelectedSkills([])
        }
      } catch (error) {
        console.error('Error parsing skills:', error)
        setSelectedSkills([])
      }
      loadNotificationPreferences()
    }
  }, [job])

  const fetchJobDetails = async () => {
    if (!user?.id || !jobId) return
    
    try {
      setLoading(true)
      setError("")
      
      const response = await jobsAPI.getById(jobId)
      console.log('Job details response:', response)
      
      if (response && response.job) {
        setJob(response.job)
      } else if (response && response.id) {
        setJob(response)
      } else {
        setError('Job not found')
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      setError('Failed to load job details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    if (!user?.id) return
    
    try {
      const response = await teamAPI.getAll(user.id)
      const teamArray = Array.isArray(response) ? response : (response?.teamMembers || response || [])
      setTeamMembers(teamArray)
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([])
    }
  }

  const loadTerritories = async () => {
    if (!user?.id) return
    
    try {
      const response = await territoriesAPI.getAll(user.id)
      const territoriesArray = Array.isArray(response) ? response : (response?.territories || response || [])
      setTerritories(territoriesArray)
    } catch (error) {
      console.error('Error loading territories:', error)
      setTerritories([])
    }
  }

  const handleSave = async () => {
    if (!job) return
    
    try {
      setSaving(true)
      setError("")
      
      const updateData = {
        scheduled_date: formData.scheduledDate && formData.scheduledTime 
          ? `${formData.scheduledDate}T${formData.scheduledTime}:00.000Z`
          : job.scheduled_date,
        notes: formData.notes,
        status: formData.status,
        team_member_id: formData.teamMemberId || null,
        territory_id: formData.territoryId || null,
        skills: JSON.stringify(selectedSkills)
      }

      await jobsAPI.update(job.id, updateData)
      
      // Refresh job data
      await fetchJobDetails()
      
      setEditing(false)
      setSuccessMessage('Job updated successfully!')
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error updating job:', error)
      setError('Failed to update job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!job) return
    
    try {
      await jobsAPI.updateStatus(job.id, newStatus)
      await fetchJobDetails() // Refresh job data
      setSuccessMessage(`Job status updated to ${newStatus}`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error updating job status:', error)
      setError('Failed to update job status')
    }
  }

  const handleAssignJob = (job) => {
    // Open team member assignment modal or navigate to assignment page
    setEditing(true)
  }

  const handleSendInvoice = async (job) => {
    try {
      // Create invoice for the job using the proper API
      const invoiceData = {
        userId: user.id,
        customerId: job.customer_id,
        jobId: job.id,
        totalAmount: job.total_amount || job.service_price,
        status: 'sent'
      }
      
      await invoicesAPI.create(invoiceData)
      
      // Update job invoice status
      await jobsAPI.update(job.id, { invoice_status: 'invoiced' })
      await fetchJobDetails() // Refresh jobs list
      setSuccessMessage('Invoice created and sent successfully!')
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error sending invoice:', error)
      setError('Error sending invoice')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'confirmed': return 'Confirmed'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <PlayCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSelectedTeamMember = () => {
    if (!job?.team_member_id) return null
    return teamMembers.find(member => member.id === job.team_member_id)
  }

  const getSelectedTerritory = () => {
    if (!job?.territory_id) return null
    return territories.find(territory => territory.id === job.territory_id)
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusSteps = () => {
    const steps = [
      { key: 'scheduled', label: 'Scheduled', icon: Calendar },
      { key: 'en_route', label: 'En Route', icon: Truck },
      { key: 'started', label: 'Started', icon: PlayCircle },
      { key: 'complete', label: 'Complete', icon: CheckCircle },
      { key: 'paid', label: 'Paid', icon: DollarSign }
    ]
    
    const currentStatus = job?.status || 'pending'
    let currentStepIndex = 0
    
    switch (currentStatus) {
      case 'pending':
        currentStepIndex = 0
        break
      case 'confirmed':
        currentStepIndex = 1
        break
      case 'in_progress':
        currentStepIndex = 2
        break
      case 'completed':
        currentStepIndex = 3
        break
      default:
        currentStepIndex = 0
    }
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStepIndex,
      current: index === currentStepIndex
    }))
  }

  const getCustomerInitials = (customer) => {
    if (!customer) return ''
    const firstName = customer.first_name || ''
    const lastName = customer.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => {
      const isSelected = prev.find(s => s.name === skill.name)
      if (isSelected) {
        return prev.filter(s => s.name !== skill.name)
      } else {
        return [...prev, skill]
      }
    })
  }

  const handleSkillsSave = async () => {
    try {
      // Save skills to job
      if (job) {
        // Always include at least one other field to avoid 'no field to update' error
        const updateData = {
          skills: JSON.stringify(selectedSkills),
          notes: job.notes || " "
        }
        await jobsAPI.update(job.id, updateData)
        // Refresh job data to show updated skills
        await fetchJobDetails()
        setSuccessMessage('Skills updated successfully!')
        setTimeout(() => setSuccessMessage(""), 3000)
      }
      setShowSkillsModal(false)
    } catch (error) {
      console.error('Error saving skills:', error)
      setError('Failed to save skills')
    }
  }

  const handleEditCustomer = () => {
    setShowCustomerModal(true)
  }

  const handleEditService = () => {
    setShowServiceModal(true)
  }

  const handleCustomerSave = async (customerData) => {
    try {
      // Update customer information
      // This would typically call a customer API update method
      console.log('Updating customer:', customerData)
      setSuccessMessage('Customer information updated successfully!')
      setTimeout(() => setSuccessMessage(""), 3000)
      setShowCustomerModal(false)
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Failed to update customer information')
    }
  }

  const handleServiceSave = async (serviceData) => {
    try {
      // Update service information in the backend
      if (job) {
        await jobsAPI.update(job.id, {
          service_name: serviceData.service_name,
          duration: serviceData.duration,
          service_price: serviceData.service_price,
          service_description: serviceData.service_description,
          notes: serviceData.notes
        });
        await fetchJobDetails();
      }
      setSuccessMessage('Service information updated successfully!')
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error('Error updating service:', error)
      setError('Failed to update service information')
    }
  }

  // Dynamic skills input
  const [availableSkills, setAvailableSkills] = useState([
    { name: 'Cleaning', level: 'Expert' },
    { name: 'Plumbing', level: 'Intermediate' },
    { name: 'Electrical', level: 'Beginner' },
    { name: 'Carpentry', level: 'Expert' },
    { name: 'Landscaping', level: 'Intermediate' },
    { name: 'Painting', level: 'Expert' }
  ])
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const skillLevels = ["Beginner", "Intermediate", "Expert"];

  // Show loading if user is not available
  if (!user) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Job not found</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  const statusSteps = getStatusSteps()
  const selectedTeamMember = getSelectedTeamMember()
  const selectedTerritory = getSelectedTerritory()

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 lg:px-6 py-4 lg:py-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/jobs")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">All Jobs</span>
              </button>
              <div className="hidden lg:block h-6 w-px bg-gray-300"></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {job.service_name} for {job.customer_first_name} {job.customer_last_name}
                </h1>
                <p className="text-gray-600 text-sm">Job #{job.id}</p>
              </div>
            </div>

            {/* Territory Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTerritoryDropdown(!showTerritoryDropdown)}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full lg:w-auto"
              >
                <Building className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {selectedTerritory ? selectedTerritory.name : 'Select Territory'}
                </span>
                {showTerritoryDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTerritoryDropdown && (
                <div className="absolute right-0 mt-2 w-full lg:w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                  {territories.map((territory) => (
                    <button
                      key={territory.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, territoryId: territory.id }))
                        setShowTerritoryDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      <div className="font-medium text-gray-900">{territory.name}</div>
                      <div className="text-sm text-gray-500">{territory.location}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline - Mobile Responsive */}
          <div className="mt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Desktop Timeline */}
              <div className="hidden lg:flex items-center justify-between w-full">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      step.completed 
                        ? 'text-green-600' 
                        : step.current 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Timeline */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : step.current 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-1 ${
                        step.completed 
                          ? 'text-green-600' 
                          : step.current 
                            ? 'text-blue-600' 
                            : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress Bar for Mobile */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((statusSteps.findIndex(step => step.current) + 1) / statusSteps.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Job Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Job Location</h2>
                  </div>
                  
                  {/* Map Placeholder */}
                  <div className="w-full h-48 lg:h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">Map View</p>
                      <p className="text-sm text-gray-400">Google Maps integration</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-900 font-medium">
                      {job.customer_address || 'Address not available'}
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
                      View directions
                    </button>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Clipboard className="w-5 h-5 text-green-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
                    </div>
                    {!editing && (
                      <button 
                        onClick={() => setEditing(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit Service
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        const serviceData = {
                          service_name: form.service_name.value,
                          duration: form.duration.value,
                          service_price: form.service_price.value,
                          service_description: form.service_description.value,
                          notes: form.notes.value
                        };
                        await handleServiceSave(serviceData);
                        setEditing(false);
                      }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="text-gray-900 font-medium">
                            {formatTime(job.scheduled_date)} • {formatDate(job.scheduled_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Service</p>
                          <input
                            name="service_name"
                            type="text"
                            defaultValue={job.service_name}
                            className="text-gray-900 font-medium border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Estimated Duration</p>
                          <input
                            name="duration"
                            type="number"
                            defaultValue={job.duration}
                            className="text-gray-900 font-medium border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <input
                            name="service_price"
                            type="number"
                            step="0.01"
                            defaultValue={job.service_price}
                            className="text-gray-900 font-medium border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Description</p>
                          <textarea
                            name="service_description"
                            defaultValue={job.service_description}
                            rows={2}
                            className="w-full text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Notes</p>
                          <textarea
                            name="notes"
                            defaultValue={job.notes}
                            rows={2}
                            className="w-full text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-700 hover:text-gray-900"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="text-gray-900 font-medium">
                            {formatTime(job.scheduled_date)} • {formatDate(job.scheduled_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Service</p>
                          <p className="text-gray-900 font-medium">{job.service_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Estimated Duration</p>
                          <p className="text-gray-900 font-medium">
                            {job.duration ? `${job.duration} minutes` : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-gray-900 font-medium">{job.service_price}</p>
                        </div>
                      </div>
                      {job.service_description && (
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-gray-900">{job.service_description}</p>
                          </div>
                        </div>
                      )}
                      {job.notes && (
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-900">{job.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Customer & Team Information */}
              <div className="space-y-6">
                {/* Customer Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
                  </div>
                  {/* Inline editable customer fields */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target;
                      const customerData = {
                        first_name: form.first_name.value,
                        last_name: form.last_name.value,
                        phone: form.phone.value,
                        email: form.email.value,
                        address: form.address.value
                      };
                      await handleCustomerSave(customerData);
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {getCustomerInitials(job)}
                        </span>
                      </div>
                      <div>
                        <input
                          name="first_name"
                          type="text"
                          defaultValue={job.customer_first_name}
                          className="text-gray-900 font-medium border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent mr-2"
                          style={{ width: 90 }}
                        />
                        <input
                          name="last_name"
                          type="text"
                          defaultValue={job.customer_last_name}
                          className="text-gray-900 font-medium border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          style={{ width: 90 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <input
                            name="phone"
                            type="tel"
                            defaultValue={job.customer_phone}
                            className="text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <input
                            name="email"
                            type="email"
                            defaultValue={job.customer_email}
                            className="text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Billing Address</p>
                          <input
                            name="address"
                            type="text"
                            defaultValue={job.customer_address}
                            className="text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Team Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Team</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Job Requirements</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">Workers needed: 1 service provider</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <span className="text-gray-900">Skills needed: </span>
                            {selectedSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedSkills.map((skill, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {skill.name} ({skill.level})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">No skill tags required</span>
                            )}
                            <button 
                              onClick={() => setShowSkillsModal(true)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                            >
                              {selectedSkills.length > 0 ? 'Edit' : 'Add'} skills
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Assigned</p>
                      {selectedTeamMember ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-xs">
                              {selectedTeamMember.first_name.charAt(0)}{selectedTeamMember.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {selectedTeamMember.first_name} {selectedTeamMember.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{selectedTeamMember.role}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-gray-500">Unassigned</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Offer job to service providers</p>
                          <p className="text-xs text-gray-400">Qualified, available providers can see and claim this job</p>
                        </div>
                        <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
                        </button>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Skills</h3>
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Skills input with dropdown */}
              <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              placeholder="Type or select a skill"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              list="skills-list"
              />
              <datalist id="skills-list">
              {availableSkills.map(skill => (
              <option key={skill.name} value={skill.name} />
              ))}
              </datalist>
              </div>
              <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <select
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
              <option value="">Select level</option>
              {skillLevels.map(level => (
              <option key={level} value={level}>{level}</option>
              ))}
              </select>
              </div>
              <div className="flex justify-end mb-4">
              <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => {
              if (!skillInput || !skillLevel) return;
              const exists = selectedSkills.find(s => s.name.toLowerCase() === skillInput.toLowerCase());
              if (!exists) {
              const newSkill = { name: skillInput, level: skillLevel };
              setSelectedSkills(prev => [...prev, newSkill]);
              // Add to availableSkills if not present
              if (!availableSkills.find(s => s.name.toLowerCase() === skillInput.toLowerCase())) {
              setAvailableSkills(prev => [...prev, newSkill]);
              }
              }
              setSkillInput("");
              setSkillLevel("");
              }}
              >
              Add Skill
              </button>
              </div>
              {/* List selected skills with remove option */}
              <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {skill.name} ({skill.level})
              <button
              type="button"
              className="ml-1 text-blue-600 hover:text-red-600"
              onClick={() => setSelectedSkills(selectedSkills.filter((_, i) => i !== idx))}
              >
              <X className="w-3 h-3" />
              </button>
              </span>
              ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSkillsSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal removed, now inline editing */}

      {/* Service Edit Modal removed, now inline editing */}
    </div>
  )
}

export default JobDetails 