"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { MapPin, Clock, Users, Wrench, ChevronDown, Plus, Search, Filter, Edit, Trash2, BarChart3, DollarSign, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import CreateTerritoryModal from "../components/create-territory-modal"
import { useAuth } from "../context/AuthContext"
import { territoriesAPI } from "../services/api"
import LoadingButton from "../components/loading-button"

const ZenbookerTerritories = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTerritory, setSelectedTerritory] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // API State
  const [territories, setTerritories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "name",
    sortOrder: "ASC"
  })

  // Initial data fetch
  useEffect(() => {
    fetchTerritories()
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTerritories()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.status, filters.search, filters.sortBy, filters.sortOrder])

  const fetchTerritories = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      const response = await territoriesAPI.getAll(user.id, {
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: 1,
        limit: 50
      })
      
      setTerritories(response.territories || [])
    } catch (error) {
      console.error('Error fetching territories:', error)
      setError("Failed to load territories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerritory = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditTerritory = (territory) => {
    setSelectedTerritory(territory)
    setIsEditModalOpen(true)
  }

  const handleDeleteTerritory = async (territoryId) => {
    if (!window.confirm('Are you sure you want to delete this territory?')) {
      return
    }
    
    try {
      await territoriesAPI.delete(territoryId)
      fetchTerritories()
    } catch (error) {
      console.error('Error deleting territory:', error)
      alert('Failed to delete territory. Please try again.')
    }
  }

  const handleTerritoryUpdate = () => {
    fetchTerritories()
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedTerritory(null)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
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
      case 'archived':
        return 'Archived'
      default:
        return status
    }
  }

  const filteredTerritories = territories.filter(territory => {
    if (activeTab === "active" && territory.status !== "active") return false
    if (activeTab === "inactive" && territory.status !== "inactive") return false
    return true
  })

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="territories" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Service Territories</h1>
                <button 
                  onClick={handleCreateTerritory}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Territory</span>
                </button>
              </div>
              <p className="text-gray-600">
                Manage the geographic areas where you provide services and do work. You can create multiple service territories with unique hours, services, and service providers.{" "}
                <button className="text-blue-600 hover:text-blue-700">Learn more</button>
              </p>
              <p className="text-gray-600 mt-2">
                You are currently using {territories.filter(t => t.status === 'active').length} of 2 service territories available on your plan.
              </p>
            </div>

            {/* Filters and Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === "active"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Active{" "}
                  <span className="ml-1 text-gray-400">
                    {territories.filter(t => t.status === "active").length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("inactive")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === "inactive"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Inactive{" "}
                  <span className="ml-1 text-gray-400">
                    {territories.filter(t => t.status === "inactive").length}
                  </span>
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search territories..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="location">Sort by Location</option>
                  <option value="total_jobs">Sort by Jobs</option>
                  <option value="total_revenue">Sort by Revenue</option>
                </select>
              </div>
            </div>

            {/* Territory Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading territories...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading territories</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={fetchTerritories}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
            <div className="space-y-4">
                {filteredTerritories.map((territory) => (
                  <div key={territory.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{territory.name}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(territory.status)}`}>
                          {getStatusLabel(territory.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTerritory(territory)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTerritory(territory.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{territory.location}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>SERVICE AREA</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {territory.radius_miles} mile radius
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>TIMEZONE</span>
                        </div>
                        <p className="text-sm text-gray-900">{territory.timezone}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>TEAM MEMBERS</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {territory.team_members?.length || 0} assigned
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Wrench className="w-4 h-4" />
                          <span>SERVICES</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {territory.services?.length || 0} services
                        </p>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{territory.total_jobs || 0}</div>
                        <div className="text-sm text-gray-600">Total Jobs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{territory.completed_jobs || 0}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(territory.total_revenue || 0)}</div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(territory.avg_job_value || 0)}</div>
                        <div className="text-sm text-gray-600">Avg Job Value</div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTerritories.length === 0 && (
                <div className="text-center py-12">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === "active" ? "No active territories" : "No inactive territories"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === "active" 
                        ? "Create your first territory to start managing service areas."
                        : "Inactive territories will appear here."
                      }
                    </p>
                    {activeTab === "active" && (
                      <button
                        onClick={handleCreateTerritory}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Territory
                      </button>
                    )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
      <CreateTerritoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTerritoryCreated={handleTerritoryUpdate}
      />
    </div>
  )
}

export default ZenbookerTerritories
