"use client"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import UserDropdown from "./user-dropdown"
import {
  Home,
  MessageSquare,
  Calendar,
  Briefcase,
  FileText,
  RotateCcw,
  CreditCard,
  Users,
  UserCheck,
  Wrench,
  Tag,
  MapPin,
  BarChart3,
  Globe,
  Settings,
  X,
} from "lucide-react"

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const sidebarItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Requests", path: "/request" },
    { icon: Calendar, label: "Schedule", path: "/schedule" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: FileText, label: "Estimates", path: "/estimates" },
    { icon: RotateCcw, label: "Recurring", path: "/recurring" },
    { icon: CreditCard, label: "Payments", path: "/payments" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: UserCheck, label: "Team", path: "/team" },
    { icon: Wrench, label: "Services", path: "/services" },
    { icon: Tag, label: "Coupons", path: "/coupons" },
    { icon: MapPin, label: "Territories", path: "/territories" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Globe, label: "Online Booking", path: "/online-booking" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation("/dashboard")}>
           <img src="/images/zenbooker-logo-v3.1-mobile.svg" alt="Zenbooker Logo"  />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-full flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">JW</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">Just web</p>
              <p className="text-xs text-gray-500 truncate">Just web Agency</p>
            </div>
          </button>
          
          <UserDropdown
            isOpen={isUserDropdownOpen}
            onClose={() => setIsUserDropdownOpen(false)}
            onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          />
        </div>
      </div>
    </>
  )
}

export default Sidebar
