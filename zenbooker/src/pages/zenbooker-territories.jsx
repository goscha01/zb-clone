"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { MapPin, Clock, Users, Wrench, ChevronDown } from "lucide-react"
import CreateTerritoryModal from "../components/create-territory-modal"

const ZenbookerTerritories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const territories = [
    {
      name: "Washington",
      location: "Washington, DC, USA",
      status: "active",
      serviceArea: "Geofence",
      timezone: "America/New_York",
      onlineBooking: true,
      providers: ["JF"],
      services: "3 services enabled",
    },
    {
      name: "Houston",
      location: "Houston, TX, USA", 
      status: "disabled",
      serviceArea: "Geofence",
      timezone: "America/Chicago",
      onlineBooking: true,
      providers: ["F", "AE"],
      services: "All services",
    }
  ]

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
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Territory
                </button>
              </div>
              <p className="text-gray-600">
                Manage the geographic areas where you provide services and do work. You can create multiple service territories with unique hours, services, and service providers.{" "}
                <button className="text-blue-600 hover:text-blue-700">Learn more</button>
              </p>
              <p className="text-gray-600 mt-2">
                You are currently using 1 of 2 service territories available on your plan.
              </p>
            </div>

            {/* Tabs and Sort */}
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
                  onClick={() => setActiveTab("disabled")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === "disabled"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Disabled
                </button>
              </div>
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                <span>Sort</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Territory Cards */}
            <div className="space-y-4">
              {territories
                .filter(territory => 
                  (activeTab === "active" && territory.status === "active") ||
                  (activeTab === "disabled" && territory.status === "disabled")
                )
                .map((territory, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{territory.name}</h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          territory.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {territory.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-6">{territory.location}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>SERVICE AREA</span>
                        </div>
                        <p className="text-sm text-gray-900">{territory.serviceArea}</p>
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
                          <span>PROVIDERS</span>
                        </div>
                        <div className="flex space-x-1">
                          {territory.providers.map((provider, idx) => (
                            <span
                              key={idx}
                              className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium"
                            >
                              {provider}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Wrench className="w-4 h-4" />
                          <span>SERVICES</span>
                        </div>
                        <p className="text-sm text-gray-900">{territory.services}</p>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "disabled" && territories.filter(t => t.status === "disabled").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-900 font-medium">This is where you'll find territories that you've deactivated</p>
                  <p className="text-gray-600 mt-2">
                    Deactivated territories don't count towards the service territories available on your plan. And you can always reactivate them later if you change your mind.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CreateTerritoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}

export default ZenbookerTerritories
