"use client"

import { Menu, Plus } from "lucide-react"

const MobileHeader = ({ onMenuClick }) => {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button onClick={onMenuClick} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">zenbooker</span>
        </div>
      </div>
      <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-blue-700">
        <span>New</span>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default MobileHeader
