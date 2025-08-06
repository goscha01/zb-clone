import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
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
  Tag,
  Star,
  MessageSquare,
  Bell,
  Zap,
  Shield,
  Award,
  Target,
  Navigation,
  Package,
  Tool,
  Wrench,
  Paintbrush,
  Leaf,
  Sparkles,
  MoreVertical,
  ExternalLink,
  Printer,
  Send,
  Edit3,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Copy,
  Trash2,
  Menu
} from "lucide-react"
import { jobsAPI, notificationAPI, territoriesAPI, teamAPI, invoicesAPI } from "../services/api"
import Sidebar from "../components/sidebar"
import { useNavigate } from "react-router-dom"
import { formatPhoneNumber } from "../utils/phoneFormatter"

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null)

  // Google Places Autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [addressLoading, setAddressLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showEditAddressModal, setShowEditAddressModal] = useState(false)

  // For address modal mapping
  useEffect(() => {
    if (showEditAddressModal && job) {
      setFormData(prev => ({
        ...prev,
        serviceAddress: {
          street: job.service_address_street || "",
          city: job.service_address_city || "",
          state: job.service_address_state || "",
          zipCode: job.service_address_zip || ""
        }
      }))
    }
    // eslint-disable-next-line
  }, [showEditAddressModal, job?.service_address_street, job?.service_address_city, job?.service_address_state, job?.service_address_zip])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  // Territories
  const [territories, setTerritories] = useState([])
  const [showTerritoryDropdown, setShowTerritoryDropdown] = useState(false)

  // Team
  const [teamMembers, setTeamMembers] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)

  // Invoice
  const [invoice, setInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState(0)

  // Notes
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState("")

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
    internalNotes: "",
    service_name: "",
    bathroom_details: "",
    duration: 0,
    serviceAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  })

  // Fetch job and notification preferences from backend
  // Fetch job and notification preferences from backend
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        const jobData = await jobsAPI.getById(jobId)
        setJob(jobData)
        setFormData({
          scheduledDate: jobData.scheduled_date ? jobData.scheduled_date.split('T')[0] : "",
          scheduledTime: jobData.scheduled_date ? jobData.scheduled_date.split('T')[1]?.substring(0, 5) : "",
          notes: jobData.notes || "",
          internalNotes: jobData.internal_notes || "",
          service_name: jobData.service_name || "",
          bathroom_details: jobData.bathroom_count || "",
          duration: jobData.duration || 0,
          serviceAddress: {
            street: jobData.service_address_street || "",
            city: jobData.service_address_city || "",
            state: jobData.service_address_state || "",
            zipCode: jobData.service_address_zip || ""
          }
        })
        // Fetch notification preferences if customer id exists
        if (jobData.customer_id) {
          try {
            const prefs = await notificationAPI.getPreferences(jobData.customer_id)
            setEmailNotifications(!!prefs.email)
            setSmsNotifications(!!prefs.sms)
          } catch (e) {
            // fallback to default
          }
        }
      } catch (err) {
        setError("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }
    if (jobId) fetchJob()
  }, [jobId])

  // Fetch territories for dropdown
  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        // Try to get userId from job or from localStorage
        let userId = null
        if (job && job.user_id) userId = job.user_id
        else {
          const user = localStorage.getItem('user')
          if (user) userId = JSON.parse(user).id
        }
        if (userId) {
          const data = await territoriesAPI.getAll(userId)
          setTerritories(data.territories || data)
        }
      } catch (e) {
        setTerritories([])
      }
    }
    fetchTerritories()
  }, [job])

  // Fetch team members for assignment
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        let userId = null
        if (job && job.user_id) userId = job.user_id
        else {
          const user = localStorage.getItem('user')
          if (user) userId = JSON.parse(user).id
        }
        if (userId) {
          const data = await teamAPI.getAll(userId)
          setTeamMembers(data.teamMembers || data)
        }
      } catch (e) {
        setTeamMembers([])
      }
    }
    fetchTeam()
  }, [job])

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!job || !job.invoice_id) return
      try {
        const data = await invoicesAPI.getById(job.invoice_id, job.user_id)
        setInvoice(data)
        setInvoiceAmount(data.total_amount || 0)
      } catch (e) {
        setInvoice(null)
      }
    }
    fetchInvoice()
  }, [job])

  // Notes value sync
  useEffect(() => {
    if (job) setNotesValue(job.notes || "")
  }, [job])

  const statusOptions = [
    { key: 'pending', label: 'Pending', color: 'bg-gray-400' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
    { key: 'in_progress', label: 'In Progress', color: 'bg-orange-500' },
    { key: 'completed', label: 'Completed', color: 'bg-purple-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
  ]

  const handleStatusChange = async (newStatus) => {
    if (!job) return
    try {
      setLoading(true)
      await jobsAPI.updateStatus(job.id, newStatus)
      setJob(prev => ({ ...prev, status: newStatus }))
      setSuccessMessage(`Job marked as ${newStatus}`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setError('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationToggle = async (type, value) => {
    if (!job || !job.customer_id) return
    try {
      if (type === 'email') {
        setEmailNotifications(value)
      } else if (type === 'sms') {
        setSmsNotifications(value)
      }
      await notificationAPI.updatePreferences(job.customer_id, {
        email: type === 'email' ? value : emailNotifications,
        sms: type === 'sms' ? value : smsNotifications
      })
    } catch (error) {
      setError('Failed to update notification preferences')
    }
  }

  // Helper to reload job from backend
  const reloadJob = async () => {
    setLoading(true)
    try {
      const jobData = await jobsAPI.getById(jobId)
      setJob(jobData)
      setFormData({
        scheduledDate: jobData.scheduled_date ? jobData.scheduled_date.split('T')[0] : "",
        scheduledTime: jobData.scheduled_date ? jobData.scheduled_date.split('T')[1]?.substring(0, 5) : "",
        notes: jobData.notes || "",
        internalNotes: jobData.internal_notes || "",
        service_name: jobData.service_name || "",
        bathroom_details: jobData.bathroom_count || "",
        duration: jobData.duration || 0,
        serviceAddress: {
          street: jobData.service_address_street || "",
          city: jobData.service_address_city || "",
          state: jobData.service_address_state || "",
          zipCode: jobData.service_address_zip || ""
        }
      })
    } catch (err) {
      setError("Failed to reload job details")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!job) return
    try {
      setLoading(true)
      const updatedJob = {
        ...job,
        scheduled_date: formData.scheduledDate && formData.scheduledTime 
          ? `${formData.scheduledDate}T${formData.scheduledTime}:00.000Z`
          : job.scheduled_date,
        notes: formData.notes,
        internal_notes: formData.internalNotes,
        service_name: formData.service_name,
        bathroom_count: formData.bathroom_details,
        duration: formData.duration,
        service_address_street: formData.serviceAddress.street,
        service_address_city: formData.serviceAddress.city,
        service_address_state: formData.serviceAddress.state,
        service_address_zip: formData.serviceAddress.zipCode
      }
      await jobsAPI.update(job.id, updatedJob)
      setSuccessMessage('Job updated successfully!')
      setTimeout(() => setSuccessMessage(""), 3000)
      await reloadJob()
    } catch (error) {
      setError('Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getCustomerInitials = () => {
    const firstName = job.customer_first_name || ''
    const lastName = job.customer_last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getCurrentStatusIndex = () => {
    return statusOptions.findIndex(option => option.key === job.status)
  }

  const ActionMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowActionMenu(!showActionMenu)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
      
      {showActionMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowActionMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                setShowEditServiceModal(true)
                setShowActionMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Service</span>
            </button>
            <button
              onClick={() => {
                setShowEditAddressModal(true)
                setShowActionMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Edit Address</span>
            </button>
            <button
              onClick={() => {
                setShowRescheduleModal(true)
                setShowActionMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Reschedule</span>
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                setShowCancelModal(true)
                setShowActionMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel Job</span>
            </button>
          </div>
        </>
      )}
    </div>
  )

  const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
    if (!isOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    )
  }

  const RescheduleModal = () => (
    <Modal
      isOpen={showRescheduleModal}
      onClose={() => setShowRescheduleModal(false)}
      title="Reschedule Job"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
        <button
          onClick={() => setShowRescheduleModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleSave()
            setShowRescheduleModal(false)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
        >
          Reschedule
        </button>
      </div>
    </Modal>
  )

  const CancelModal = () => (
    <Modal
      isOpen={showCancelModal}
      onClose={() => setShowCancelModal(false)}
      title="Cancel Job"
    >
      <p className="text-gray-600 mb-6">
        Are you sure you want to cancel this job? This action cannot be undone.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => setShowCancelModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1"
        >
          Keep Job
        </button>
        <button
          onClick={() => {
            handleStatusChange('cancelled')
            setShowCancelModal(false)
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 order-1 sm:order-2"
        >
          Cancel Job
        </button>
      </div>
    </Modal>
  )

  const EditServiceModal = () => (
    <Modal
      isOpen={showEditServiceModal}
      onClose={() => setShowEditServiceModal(false)}
      title="Edit Service"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
          <input
            type="text"
            value={formData.service_name}
            onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom Details</label>
          <textarea
            value={formData.bathroom_details}
            onChange={(e) => setFormData(prev => ({ ...prev, bathroom_details: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
        <button
          onClick={() => setShowEditServiceModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleSave()
            setShowEditServiceModal(false)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  )

  const EditAddressModal = () => (
    <Modal
      isOpen={showEditAddressModal}
      onClose={() => setShowEditAddressModal(false)}
      title="Edit Address"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={formData.serviceAddress.street}
            onChange={async (e) => {
              const value = e.target.value
              setFormData(prev => ({
                ...prev,
                serviceAddress: { ...prev.serviceAddress, street: value }
              }))
              // Call backend autocomplete endpoint for suggestions
              if (value.length > 2) {
                setAddressLoading(true)
                try {
                  const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`)
                  const data = await res.json()
                  setAddressSuggestions(data.predictions || [])
                } catch {
                  setAddressSuggestions([])
                } finally {
                  setAddressLoading(false)
                }
              } else {
                setAddressSuggestions([])
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            placeholder="Start typing address..."
            autoComplete="off"
          />
          {addressLoading && <div className="text-xs text-gray-400 mt-1">Loading suggestions...</div>}
          {addressSuggestions.length > 0 && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow mt-1 w-full max-h-48 overflow-y-auto">
              {addressSuggestions.map(s => (
                <button
                  key={s.place_id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={async (e) => {
                    e.preventDefault()
                    setAddressSuggestions([])
                    setAddressLoading(true)
                    try {
                      // Fetch full address details from backend
                      const res = await fetch(`/api/places/details?place_id=${s.place_id}`)
                      const data = await res.json()
                      // Assume backend returns { street, city, state, zipCode }
                      setFormData(prev => ({
                        ...prev,
                        serviceAddress: {
                          street: data.street || s.description || "",
                          city: data.city || "",
                          state: data.state || "",
                          zipCode: data.zipCode || ""
                        }
                      }))
                    } catch {
                      // fallback: just set street
                      setFormData(prev => ({ ...prev, serviceAddress: { ...prev.serviceAddress, street: s.description } }))
                    } finally {
                      setAddressLoading(false)
                    }
                  }}
                >
                  {s.description}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.serviceAddress.city}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              serviceAddress: { ...prev.serviceAddress, city: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.serviceAddress.state}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                serviceAddress: { ...prev.serviceAddress, state: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={formData.serviceAddress.zipCode}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                serviceAddress: { ...prev.serviceAddress, zipCode: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
        <button
          onClick={() => setShowEditAddressModal(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleSave()
            setShowEditAddressModal(false)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  )

  const MobileSidebar = () => (
    <>
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden overflow-y-auto ${
        showMobileSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <SidebarContent />
        </div>
      </div>
    </>
  )

  const SidebarContent = () => (
    <>
      {/* Customer Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Customer</h3>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{getCustomerInitials()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {job.customer_first_name} {job.customer_last_name}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${job.customer_phone}`} className="text-blue-600 hover:text-blue-700">
              {formatPhoneNumber(job.customer_phone)}
            </a>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${job.customer_email}`} className="text-blue-600 hover:text-blue-700 truncate">
              {job.customer_email}
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">BILLING ADDRESS</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Same as service address</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">EXPECTED PAYMENT METHOD</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>No payment method on file</span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
              Add a card to charge later
            </button>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Team</h3>
        <div className="space-y-4">
          {/* Job Requirements Editable */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">JOB REQUIREMENTS</span>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setEditing('team')}
              >Edit</button>
            </div>
            {editing === 'team' ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Workers needed</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.workers_needed || job.workers_needed || 1}
                    onChange={e => setFormData(prev => ({ ...prev, workers_needed: parseInt(e.target.value) || 1 }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Skills needed</span>
                  <input
                    type="text"
                    value={formData.skills || (job.skills && job.skills.join(', ')) || ''}
                    onChange={e => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Comma separated"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    className="px-3 py-1 text-gray-600 border border-gray-300 rounded"
                    onClick={() => { setEditing(false); setFormData(f => ({ ...f, workers_needed: job.workers_needed, skills: (job.skills && job.skills.join(', ')) || '' })) }}
                  >Cancel</button>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await jobsAPI.update(job.id, {
                          ...job,
                          workers_needed: formData.workers_needed || job.workers_needed,
                          skills: (formData.skills || '').split(',').map(s => s.trim()).filter(Boolean)
                        })
                        setEditing(false)
                        setSuccessMessage('Job requirements updated!')
                        setTimeout(() => setSuccessMessage(''), 2000)
                        await reloadJob()
                      } catch (e) {
                        setError('Failed to update requirements')
                      } finally {
                        setLoading(false)
                      }
                    }}
                  >Save</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Workers needed</span>
                  <span className="font-medium">{job.workers_needed} service provider</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills needed</span>
                  <span className="font-medium">{job.skills && job.skills.length ? job.skills.join(', ') : 'No skill tags required'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Team Member Editable */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">ASSIGNED</span>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setAssigning(true)}
              >Assign</button>
            </div>
            <div className="text-center py-4">
              {job.team_member_id ? (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">
                    {(() => {
                      const member = teamMembers.find(m => String(m.id) === String(job.team_member_id));
                      if (!member) return <span className="text-red-500">Assigned (not found in team list)</span>;
                      return member.name || member.fullName || member.email || member.id;
                    })()}
                  </p>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await jobsAPI.assignToTeamMember(job.id, null)
                        setSuccessMessage('Unassigned!')
                        setTimeout(() => setSuccessMessage(''), 2000)
                        await reloadJob()
                      } catch (e) {
                        setError('Failed to unassign')
                      } finally {
                        setLoading(false)
                      }
                    }}
                  >Unassign</button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Unassigned</p>
                  <p className="text-xs text-gray-400">No service providers are assigned to this job</p>
                </>
              )}
              {assigning && (
                <div className="mt-3">
                  <select
                    className="w-full border border-gray-300 rounded p-2"
                    value={selectedTeamMember || ''}
                    onChange={e => setSelectedTeamMember(e.target.value)}
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.email || m.id}</option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      className="px-3 py-1 text-gray-600 border border-gray-300 rounded"
                      onClick={() => { setAssigning(false); setSelectedTeamMember(null) }}
                    >Cancel</button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={async () => {
                        if (!selectedTeamMember) return
                        setLoading(true)
                        try {
                          await jobsAPI.assignToTeamMember(job.id, selectedTeamMember)
                          setAssigning(false)
                          setSelectedTeamMember(null)
                          setSuccessMessage('Assigned!')
                          setTimeout(() => setSuccessMessage(''), 2000)
                          await reloadJob()
                        } catch (e) {
                          setError('Failed to assign')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >Assign</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Offer job to service providers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Allows qualified, available providers to see and claim this job. 
              <button className="text-blue-600 hover:text-blue-700 ml-1">Learn more</button>
            </p>
          </div>
        </div>
      </div>

      {/* Notes & Files */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Notes & Files</h3>
        <div className="py-4">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          {editingNotes ? (
            <>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-2"
                rows={4}
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded"
                  onClick={() => { setEditingNotes(false); setNotesValue(job.notes || "") }}
                >Cancel</button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await jobsAPI.update(job.id, { ...job, notes: notesValue })
                      setEditingNotes(false)
                      setSuccessMessage("Notes updated!")
                      setTimeout(() => setSuccessMessage("") , 2000)
                      await reloadJob()
                    } catch (e) {
                      setError("Failed to update notes")
                    } finally {
                      setLoading(false)
                    }
                  }}
                >Save</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-2 whitespace-pre-line min-h-[48px]">{job.notes || <span className="text-gray-400">No notes</span>}</p>
              <button
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => setEditingNotes(true)}
              >
                <Edit className="w-4 h-4" />
                <span>{job.notes ? "Edit Note" : "Add Note"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Customer notifications</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">NOTIFICATION PREFERENCES</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Emails</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Text messages</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={smsNotifications}
                    onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Confirmation</h4>
                </div>
                <p className="text-sm font-semibold text-gray-900">Appointment Confirmation</p>
                <p className="text-xs text-gray-500">10 minutes ago • Email • Opened</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Customer feedback</h3>
        
        <p className="text-sm text-gray-600 mb-2">
          An email will be sent to the customer asking them to rate the service after the job is marked complete.
        </p>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Learn more.
        </button>
      </div>

      {/* Conversion Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Conversion summary</h3>
        
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No conversion data available</p>
        </div>
      </div>
    </>
  )

  if (loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 text-lg">Loading job details...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <button
              className="flex items-center text-blue-600 hover:text-blue-700 flex-shrink-0"
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm hidden sm:inline">All Jobs</span>
            </button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {job.service_name} for {job.customer_first_name} {job.customer_last_name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Job #{job.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="hidden sm:flex items-center space-x-2 relative">
              <span className="text-sm text-gray-600">Territory</span>
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded cursor-pointer relative"
                onClick={() => setShowTerritoryDropdown(v => !v)}
              >
                <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                <span className="text-sm font-medium mr-1">{job.territory}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </div>
              {showTerritoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow z-50">
                  {territories.filter(t => t.name !== job.territory).map(t => (
                    <button
                      key={t.id || t.name}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100`}
                      onClick={async () => {
                        setShowTerritoryDropdown(false)
                        setLoading(true)
                        try {
                          await jobsAPI.update(job.id, { ...job, territory: t.name })
                          await reloadJob()
                          setSuccessMessage('Territory updated!')
                          setTimeout(() => setSuccessMessage(""), 2000)
                        } catch (e) {
                          setError('Failed to update territory')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <ActionMenu />
          </div>
        </div>

        {/* Status Dropdown - Robust Design */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <div className="relative">
              <button
                className="flex items-center border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => setEditing('status')}
                style={{ minWidth: 140 }}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusOptions.find(s => s.key === job.status)?.color || 'bg-gray-300'}`}></span>
                <span>{statusOptions.find(s => s.key === job.status)?.label || job.status}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </button>
              {editing === 'status' && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                  {statusOptions.map(status => (
                    <button
                      key={status.key}
                      className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 ${job.status === status.key ? 'font-semibold bg-gray-100' : ''}`}
                      onClick={() => setSelectedTeamMember(status.key)}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status.color}`}></span>
                      {status.label}
                    </button>
                  ))}
                  <div className="flex justify-end space-x-2 p-2 border-t border-gray-100">
                    <button
                      className="px-3 py-1 text-gray-600 border border-gray-300 rounded"
                      onClick={() => { setEditing(false); setSelectedTeamMember(null) }}
                    >Cancel</button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={async () => {
                        if (!selectedTeamMember || selectedTeamMember === job.status) { setEditing(false); return; }
                        setLoading(true)
                        try {
                          await jobsAPI.updateStatus(job.id, selectedTeamMember)
                          setSuccessMessage(`Job marked as ${statusOptions.find(s => s.key === selectedTeamMember)?.label || selectedTeamMember}`)
                          setTimeout(() => setSuccessMessage(""), 2000)
                          setEditing(false)
                          setSelectedTeamMember(null)
                          await reloadJob()
                        } catch (err) {
                          setError('Failed to update status')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-4 sm:mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Column */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="relative">
              {/* Google Maps Placeholder */}
              <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500">Google Maps Integration</p>
                </div>
              </div>
              
              {/* Location Info Overlay */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">JOB LOCATION</h3>
                      <p className="text-gray-700 font-medium text-sm sm:text-base truncate">{job.service_address_street}</p>
                      <p className="text-gray-700 text-sm sm:text-base">{job.service_address_city}</p>
                      <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium mt-1 flex items-center">
                        View directions <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                    <button
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
                      onClick={() => setShowEditAddressModal(true)}
                    >
                      Edit Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">DATE & TIME</h3>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      {formatTime(job.scheduled_date)}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">{formatDate(job.scheduled_date)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowRescheduleModal(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">JOB DETAILS</h3>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setEditing(true)}
              >
                Edit Service
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={e => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathroom Details</label>
                  <input
                    type="text"
                    value={formData.bathroom_details}
                    onChange={e => setFormData(prev => ({ ...prev, bathroom_details: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded"
                    onClick={() => { setEditing(false); setFormData(f => ({ ...f, service_name: job.service_name, bathroom_details: job.bathroom_count, duration: job.duration })) }}
                  >Cancel</button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={async () => { await handleSave(); setEditing(false); }}
                  >Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <Clipboard className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{job.service_name}</p>
                  <p className="text-gray-600 text-sm mb-2">Default service category</p>
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Bathroom:</strong></p>
                    <p className="text-sm text-gray-600">{job.bathroom_count}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{job.duration} minutes</p>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {job.invoice_status || 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Due Aug 31, 2025</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Add Payment</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                  Send Invoice
                </button>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">$0.00</span>
                <span className="text-lg font-semibold">${job.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Amount paid</span>
                <span>Amount due</span>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{job.service_name}</span>
                  <span>${job.service_price}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {job.bathroom_count} (${job.service_price})
                </div>
              </div>

              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <Edit className="w-4 h-4 mr-1" />
                Edit Service & Pricing
              </button>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${job.service_price}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${job.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount paid</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total due</span>
                  <span>${job.total_amount}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <h4 className="font-semibold mb-3">Payments</h4>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No payments</p>
                  <p className="text-sm text-gray-400">
                    When you process or record a payment for this invoice, it will appear here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, shown as slide-out */}
        <div className="hidden lg:block w-80 p-6 space-y-6">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar />
      </div>

      {/* Modals */}
      <RescheduleModal />
      <CancelModal />
      <EditServiceModal />
      <EditAddressModal />
    </div>
  </div>
  )
}

export default JobDetails