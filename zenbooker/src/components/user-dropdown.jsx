"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Wrench, Settings, Gift, HelpCircle, LogOut } from "lucide-react"

const UserDropdown = ({ isOpen, onClose, onToggle }) => {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSignOut = () => {
    // Clear any stored auth tokens
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    
    // Redirect to login page
    navigate("/login")
    onClose()
    
    // Optional: Show success message
    console.log("Successfully signed out")
  }

  const menuItems = [
    {
      icon: Wrench,
      label: "Services",
      onClick: () => {
        navigate("/services")
        onClose()
      }
    },
    {
      icon: Settings,
      label: "User Settings",
      onClick: () => {
        navigate("/settings/account")
        onClose()
      }
    },
    {
      icon: Gift,
      label: "What's New",
      onClick: () => {
        navigate("/whats-new")
        onClose()
      }
    },
    {
      icon: HelpCircle,
      label: "Zenbooker Help",
      onClick: () => {
        navigate("/help")
        onClose()
      }
    },
    {
      icon: LogOut,
      label: "Sign Out",
      onClick: handleSignOut
    }
  ]

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-4 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        )
      })}
      
      {/* User Info at Bottom */}
      <div className="border-t border-gray-200 mt-2 pt-2 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs">JW</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Just web</p>
            <p className="text-xs text-gray-500 truncate">Just web Agency</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDropdown 