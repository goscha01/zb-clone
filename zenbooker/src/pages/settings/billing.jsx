"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import PlanSelectionModal from "../../components/plan-selection-modal"
import { ChevronLeft, Lock } from "lucide-react"

const BillingSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const navigate = useNavigate()
  const [billingDetails, setBillingDetails] = useState({
    currentPlan: "Standard",
    isTrial: true,
    trialDaysLeft: 6,
    trialEndDate: "July 4",
    monthlyPrice: 29,
    cardNumber: ""
  })

  const handleStartSubscription = () => {
    // Handle subscription logic here
    console.log("Starting subscription...")
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Zenbooker Account</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Current Plan Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Current plan</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xl font-semibold text-gray-900">Standard</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">Trial</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPlanModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Change Plan
                </button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600">Trial status</h3>
                <p className="text-gray-900 mt-1">{billingDetails.trialDaysLeft} days left</p>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Subscribe to Zenbooker for ${billingDetails.monthlyPrice}/month USD
                </h2>
                <h3 className="text-lg text-gray-700 mb-4">
                  to keep using your account.
                </h3>
                <p className="text-gray-600">
                  You can cancel any time and you won't be charged until after<br />
                  your trial ends on {billingDetails.trialEndDate}
                </p>
              </div>

              {/* Card Input */}
              <div className="max-w-lg mx-auto">
                <div className="mb-6">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Card number
                    <Lock className="w-4 h-4 text-gray-400 ml-1" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Card number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={billingDetails.cardNumber}
                      onChange={(e) => setBillingDetails({ ...billingDetails, cardNumber: e.target.value })}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-24 px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-16 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartSubscription}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start Subscription on {billingDetails.trialEndDate}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  )
}

export default BillingSettings