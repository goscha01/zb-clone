"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import AddTeamMemberModal from "../components/add-team-member-modal"
import { Search, ChevronDown, Clock, Zap, Settings, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"

const ZenbookerTeam = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false)

  const tabs = [
    { id: "active", label: "Active", count: 1 },
    { id: "invited", label: "Invited", count: 0 },
    { id: "deactivated", label: "Deactivated", count: 0 },
  ]

  const handleAddTeamMember = (teamMemberData) => {
    // Here you would typically make an API call to save the team member
    console.log("Saving team member:", teamMemberData)
    // After saving, you might want to refresh the team members list
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="team" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
          <button 
            onClick={() => setIsAddTeamMemberModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Add Team Member
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 relative font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label} ({tab.count})
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All team members</option>
                <option>Active members</option>
                <option>Service providers</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</span>
                </div>
                <div className="col-span-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Access Role</span>
                </div>
                <div className="col-span-3 flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Provider</span>
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {/* Team Member Row */}
            <div 
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/team/just-web")}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium text-sm">JW</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">Just web</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        ACTIVATED
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">adeniyiadejuwon0@gmail.com</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-gray-900">Account Owner</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-gray-900">Yes</span>
                </div>
                <div className="col-span-1 flex items-center justify-end space-x-1">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle availability click
                    }}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle assignments click
                    }}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle settings click
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button disabled className="p-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button disabled className="p-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddTeamMemberModalOpen}
        onClose={() => setIsAddTeamMemberModalOpen(false)}
        onSave={handleAddTeamMember}
      />
    </div>
  )
}

export default ZenbookerTeam
