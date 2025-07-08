"use client"

import { X } from "lucide-react"
import { useState } from "react"

const ExportCustomersModal = ({ isOpen, onClose }) => {
  const [dateRange, setDateRange] = useState("Jun 22, 2025 - Jun 29, 2025")
  const [exportType, setExportType] = useState("date_range")

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Export customers</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Export your customers in a CSV file for Excel, Numbers, or other spreadsheet programs
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="date_range"
                name="export_type"
                value="date_range"
                checked={exportType === "date_range"}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1 text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <label htmlFor="date_range" className="text-sm text-gray-900 leading-none pt-1">
                Export customers created within this date range:
              </label>
            </div>

            <div className="pl-7">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                disabled={exportType !== "date_range"}
              >
                <option>Jun 22, 2025 - Jun 29, 2025</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="all_customers"
                name="export_type"
                value="all_customers"
                checked={exportType === "all_customers"}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1 text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <label htmlFor="all_customers" className="text-sm text-gray-900 leading-none pt-1">
                Export all customers
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle export logic here
                onClose()
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Export {exportType === "date_range" ? "0" : "all"} customers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportCustomersModal 