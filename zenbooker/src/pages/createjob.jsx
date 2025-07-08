"use client"

import React, { useState } from 'react';
import { Search, Plus, X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Sidebar from '../components/sidebar';
import MobileHeader from '../components/mobile-header';
import CustomerModal from "../components/customer-modal"

export default function CreateJobPage() {
  const [customerSearch, setCustomerSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({  
    fullName: '',
    primaryAddress: '',
    aptUnit: '',
    phoneNumber: '',
    email: ''
  });
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm({
      ...customerForm,
      [field]: value 
    });
  };

  const handleSaveCustomer = () => {
    // Logic to save the customer
    console.log('Customer saved:', customerForm);
    setShowNewCustomerModal(false);
  };

  const handleCancelCustomer = () => {
    setShowNewCustomerModal(false);
    setCustomerForm({
      fullName: '',
      primaryAddress: '',
      aptUnit: '',
      phoneNumber: '',
      email: ''
    });
  };

  const handleCustomerSave = (customerData) => {
    // Here you would typically make an API call to save the customer
    console.log("Saving customer:", customerData)
    setSelectedCustomer(customerData)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-display font-semibold text-gray-900">Create Job</h1>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Schedule Job
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Customer Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  <Plus size={18} />
                  <span>New Customer</span>
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search customers"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Services</h2>
              </div>
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No services selected</p>
                  <p className="text-sm text-gray-500 mt-1">Add services to this job</p>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
              </div>
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No schedule set</p>
                  <p className="text-sm text-gray-500 mt-1">Set date and time for this job</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleCustomerSave}
      />
    </div>
  );
}