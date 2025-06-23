"use client"
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
  Globe,
  Settings,
  X,
} from "lucide-react"

const Sidebar = ({ isOpen, onClose }) => {
  const sidebarItems = [
    { icon: Home, label: "Dashboard", active: false },
    { icon: MessageSquare, label: "Requests", active: true },
    { icon: Calendar, label: "Schedule", active: false },
    { icon: Briefcase, label: "Jobs", active: false },
    { icon: FileText, label: "Estimates", active: false },
    { icon: RotateCcw, label: "Recurring", active: false },
    { icon: CreditCard, label: "Payments", active: false },
    { icon: Users, label: "Customers", active: false },
    { icon: UserCheck, label: "Team", active: false },
    { icon: Wrench, label: "Services", active: false },
    { icon: Tag, label: "Coupons", active: false },
    { icon: MapPin, label: "Territories", active: false },
    { icon: Globe, label: "Online Booking", active: false },
    { icon: Settings, label: "Settings", active: false },
  ]

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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">zenbooker</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon
              return (
                <li key={index}>
                  <a
                    href="#"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      // Close sidebar on mobile when item is clicked
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">JW</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Just web</p>
              <p className="text-xs text-gray-500 truncate">Just web Agency</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
