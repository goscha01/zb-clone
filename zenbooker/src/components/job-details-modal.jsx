"use client"

import { useState } from "react"
import { X, User, Clock, MapPin, DollarSign, Phone, Mail, Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react"

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon(job.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{job.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{job.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Earnings</p>
                  <p className="font-medium text-green-600">{job.earnings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.client}</p>
                  <p className="text-sm text-gray-500">Primary Contact</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">client@example.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{job.type === 'plumbing' ? 'Plumbing Service' : 'Repair Service'}</p>
                  <p className="text-sm text-gray-500">Service Type</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {job.type === 'plumbing' 
                    ? 'Kitchen renovation including sink replacement, faucet installation, and pipe repairs.'
                    : 'Bathroom repair including toilet replacement, shower head installation, and leak fixes.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {job.type === 'plumbing' 
                  ? 'Client requested eco-friendly fixtures. Please bring extra fittings for older plumbing system.'
                  : 'Client mentioned water pressure issues. Check main valve and recommend upgrades if needed.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
            Edit Job
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsModal 