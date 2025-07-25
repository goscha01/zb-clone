import { useState, useEffect } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { Plus, Search, Filter, Users, TrendingUp, Calendar, DollarSign, Clock, Eye, Edit, Trash2, UserPlus, BarChart3, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { teamAPI } from "../services/api"
import AddTeamMemberModal from "../components/add-team-member-modal"
import LoadingButton from "../components/loading-button"
import { useNavigate } from "react-router-dom"

const ZenbookerTeam = () => {
  const { user } = useAuth()
  console.log('Current user:', user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("members")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // API State
  const [teamMembers, setTeamMembers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "first_name",
    sortOrder: "ASC"
  })

  const navigate = useNavigate()

  // Initial data fetch
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTeamMembers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.status, filters.search, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics()
    }
  }, [activeTab])

  const fetchTeamMembers = async () => {
    console.log('Fetching team members for user:', user?.id)
    if (!user?.id) {
      console.log('No user ID found, skipping fetch')
      return
    }
    
    try {
      setLoading(true)
      setError("")
      
      console.log('Calling teamAPI.getAll with params:', {
        userId: user.id,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: 1,
        limit: 50
      })
      
      const response = await teamAPI.getAll(user.id, {
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: 1,
        limit: 50
      })
      
      console.log('Team API response:', response)
      // The backend returns { teamMembers: [...], pagination: {...} }
      setTeamMembers(response.teamMembers || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
      setError("Failed to load team members. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      const response = await teamAPI.getAnalytics(user.id)
      setAnalytics(response)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError("Failed to load analytics. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => {
    setIsAddModalOpen(true)
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleViewMember = (member) => {
    // Navigate to team member details page
    navigate(`/team/${member.id}`)
  }

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return
    }
    
    try {
      await teamAPI.delete(memberId)
      fetchTeamMembers()
    } catch (error) {
      console.error('Error deleting team member:', error)
      alert('Failed to delete team member. Please try again.')
    }
  }

  const handleMemberUpdate = () => {
    fetchTeamMembers()
    setIsEditModalOpen(false)
    setSelectedMember(null)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      case 'on_leave':
        return 'On Leave'
      default:
        return 'Unknown'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your team members, track performance, and optimize productivity
                  </p>
                </div>
                <button
                  onClick={handleAddMember}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("members")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "members"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Members
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "analytics"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Performance Analytics
                </button>
              </nav>
            </div>

            {/* Team Members Tab */}
            {activeTab === "members" && (
              <div>
                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange({ status: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>

                      <select
                        value={`${filters.sortBy}:${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split(":")
                          handleFilterChange({ sortBy, sortOrder })
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="first_name:ASC">Sort by: Name A-Z</option>
                        <option value="first_name:DESC">Sort by: Name Z-A</option>
                        <option value="total_jobs:DESC">Sort by: Most Jobs</option>
                        <option value="avg_job_value:DESC">Sort by: Highest Value</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingButton />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first team member.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleAddMember}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <li key={member.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {member.first_name?.[0]}{member.last_name?.[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.first_name} {member.last_name}
                                    </p>
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                      {getStatusLabel(member.status)}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center text-sm text-gray-500">
                                    <span>{member.email}</span>
                                    {member.phone && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>{member.phone}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewMember(member)}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditMember(member)}
                                  className="p-2 text-gray-400 hover:text-blue-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="p-2 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingButton />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                ) : analytics ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Cards */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                            <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.total_revenue)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                            <dd className="text-lg font-medium text-gray-900">{analytics.total_jobs || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Avg Job Duration</dt>
                            <dd className="text-lg font-medium text-gray-900">{formatDuration(analytics.avg_job_duration)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Analytics will appear once you have team members and completed jobs.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberUpdate}
        userId={user?.id}
      />

      {/* Edit Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleMemberUpdate}
        member={selectedMember}
        isEditing={true}
        userId={user?.id}
      />
    </div>
  )
}

export default ZenbookerTeam
