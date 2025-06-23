"use client"

import { Mail } from "lucide-react"

const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Yet</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          You haven't received any requests yet. Once customers start submitting booking or quote requests, they'll
          appear here
        </p>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">How Requests Work</button>
      </div>
    </div>
  )
}

export default EmptyState
