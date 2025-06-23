"use client"

import { Users, UserX } from "lucide-react"

const ScheduleSidebar = ({ activeFilter, onFilterChange }) => {
  const jobAssignments = [
    { id: "all", label: "All Jobs", icon: Users, active: true },
    { id: "unassigned", label: "Unassigned", icon: UserX },
    { id: "justweb", label: "Just web", avatar: "JW" },
  ]

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">JOBS ASSIGNED TO</h3>
        <nav className="space-y-1">
          {jobAssignments.map((assignment) => {
            const isActive = activeFilter === assignment.id
            return (
              <button
                key={assignment.id}
                onClick={() => onFilterChange(assignment.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {assignment.avatar ? (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">{assignment.avatar}</span>
                  </div>
                ) : (
                  <assignment.icon className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{assignment.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default ScheduleSidebar
