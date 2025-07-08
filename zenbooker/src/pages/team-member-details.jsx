"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ChevronLeft, 
  HelpCircle, 
  Clock, 
  AlertCircle, 
  Mail, 
  MessageSquare,
  Calendar,
  Tag as TagIcon
} from "lucide-react"

const TeamMemberDetails = () => {
  const navigate = useNavigate()
  const [workingHours, setWorkingHours] = useState({
    sunday: { available: false, hours: "" },
    monday: { available: true, hours: "9:00 AM - 6:00 PM" },
    tuesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    wednesday: { available: true, hours: "9:00 AM - 6:00 PM" },
    thursday: { available: true, hours: "9:00 AM - 6:00 PM" },
    friday: { available: true, hours: "9:00 AM - 6:00 PM" },
    saturday: { available: false, hours: "" }
  })

  const [settings, setSettings] = useState({
    isServiceProvider: true,
    canEditAvailability: true,
    limitJobsPerDay: false,
    canAutoAssign: true,
    canClaimJobs: true,
    emailNotifications: true,
    smsNotifications: false
  })

  const calendarColors = [
    "#FF9500", "#FF2D55", "#FF3B30", "#FFCC00", "#AF52DE", 
    "#007AFF", "#34C759", "#5856D6", "#00C7BE", "#FF2D55",
    "#FF3B30", "#5856D6", "#00C7BE", "#5856D6"
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => navigate("/team")}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              All Team Members
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">JW</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Just web</h1>
                  <p className="text-sm text-gray-500">Account Owner</p>
                </div>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Mobile phone</label>
                  <p className="mt-1 text-sm text-gray-400">No phone number</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">adeniyiadejuwon0@gmail.com</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-sm text-gray-400">No address on file</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Account Activated
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1 text-sm text-gray-900">Account Owner</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Role permissions</label>
                <p className="mt-1 text-sm text-gray-900">Has full access to all areas of account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Edit
              </button>
            </div>
            <p className="text-sm text-gray-500">No custom metadata added yet</p>
          </div>
        </div>

        {/* Service Provider Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Service Provider</h2>
                <p className="text-sm text-gray-500">This team member can be assigned to jobs</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.isServiceProvider ? 'bg-green-500' : 'bg-gray-200'
                }`}
                onClick={() => setSettings(s => ({ ...s, isServiceProvider: !s.isServiceProvider }))}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.isServiceProvider ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Availability Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Availability</h3>
              <p className="text-sm text-gray-500">
                Manage this team member's availability by editing their regular work hours, or by adding custom availability
                for specific dates. <button className="text-blue-600 hover:text-blue-700">Learn more...</button>
              </p>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-sm font-medium text-gray-900">Allow this team member to edit their availability</label>
                <p className="text-sm text-gray-500">The team member's role allows them to edit their availability</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.canEditAvailability ? 'bg-green-500' : 'bg-gray-200'
                }`}
                onClick={() => setSettings(s => ({ ...s, canEditAvailability: !s.canEditAvailability }))}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.canEditAvailability ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Recurring Hours */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-900">RECURRING HOURS</h4>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {Object.entries(workingHours).map(([day, { available, hours }]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 capitalize">{day}</span>
                      <span className="text-sm text-gray-500">{available ? hours : "Unavailable"}</span>
                    </div>
                  ))}
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Edit Hours
                  </button>
                </div>
              </div>

              {/* Custom Availability */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-900">CUSTOM AVAILABILITY</h4>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-4">Add a date override</p>
                  <p className="text-xs text-gray-500 mb-4">Customize this provider's availability for specific dates.</p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Add Date Override
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Limit the number of jobs per day for this provider</label>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.limitJobsPerDay ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  onClick={() => setSettings(s => ({ ...s, limitJobsPerDay: !s.limitJobsPerDay }))}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.limitJobsPerDay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Assignment</h3>
              <p className="text-sm text-gray-500">
                Control whether this provider can be auto-assigned to jobs, or claim eligible jobs that you've offered
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Can be auto-assigned jobs</label>
                <button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.canAutoAssign ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  onClick={() => setSettings(s => ({ ...s, canAutoAssign: !s.canAutoAssign }))}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.canAutoAssign ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Can claim available job offers</label>
                <button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.canClaimJobs ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  onClick={() => setSettings(s => ({ ...s, canClaimJobs: !s.canClaimJobs }))}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.canClaimJobs ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">
                How should this service provider be notified when they are assigned to a job?
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Alerts: Not enabled</h4>
                  <p className="text-sm text-gray-500">This service provider has not enabled push notifications.</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">Emails</label>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.emailNotifications ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  onClick={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">Text Messages (SMS)</label>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.smsNotifications ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  onClick={() => setSettings(s => ({ ...s, smsNotifications: !s.smsNotifications }))}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Skills</h3>
              <p className="text-sm text-gray-500">
                Skill tags can be used to make sure workers meet specific job-related skills, certifications, equipment and licensing requirements.
              </p>
            </div>

            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <TagIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">This provider doesn't have any skill tags yet</p>
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Edit Skills
              </button>
            </div>
          </div>

          {/* Calendar Color Section */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Calendar color</h3>
            <div className="flex flex-wrap gap-2">
              {calendarColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamMemberDetails 