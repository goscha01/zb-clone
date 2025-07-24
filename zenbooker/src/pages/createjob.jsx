"use client"

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Calendar, Clock, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from '../components/sidebar';
import MobileHeader from '../components/mobile-header';
import CustomerModal from "../components/customer-modal";
import { useNavigate } from 'react-router-dom';
import { jobsAPI, customersAPI, servicesAPI, teamAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    customerId: "",
    serviceId: "",
    teamMemberId: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    notes: "",
    status: "pending"
  });

  // Data lists
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  // UI state
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  // Selected items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    // Filter customers based on search
    if (customerSearch) {
      const filtered = (customers || []).filter(customer =>
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers || []);
    }
  }, [customerSearch, customers]);

  useEffect(() => {
    // Filter services based on search
    if (serviceSearch) {
      const filtered = (services || []).filter(service =>
        service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        service.category?.toLowerCase().includes(serviceSearch.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services || []);
    }
  }, [serviceSearch, services]);

  // Show loading if user is not available (after all hooks are declared)
  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    if (!user?.id) {
      console.error('User not available');
      return;
    }
    
    try {
      const [customersData, servicesData, teamData] = await Promise.all([
        customersAPI.getAll(user.id),
        servicesAPI.getAll(user.id),
        teamAPI.getAll(user.id)
      ]);

      console.log('Team data received:', teamData);

      // Ensure we have arrays, even if API returns unexpected format
      const customersArray = Array.isArray(customersData) ? customersData : [];
      const servicesArray = Array.isArray(servicesData) ? servicesData : [];
      const teamArray = Array.isArray(teamData) ? teamData : (teamData?.teamMembers || teamData || []);

      setCustomers(customersArray);
      setServices(servicesArray);
      setTeamMembers(teamArray);
      setFilteredCustomers(customersArray);
      setFilteredServices(servicesArray);
      
      console.log('Team members set:', teamArray);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      // Set empty arrays as fallback
      setCustomers([]);
      setServices([]);
      setTeamMembers([]);
      setFilteredCustomers([]);
      setFilteredServices([]);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
    setShowCustomerDropdown(false);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData(prev => ({ ...prev, serviceId: service.id }));
    setServiceSearch(service.name);
    setShowServiceDropdown(false);
  };

  const handleTeamMemberSelect = (member) => {
    setSelectedTeamMember(member);
    setFormData(prev => ({ ...prev, teamMemberId: member?.id || null }));
    setShowTeamDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('User not available. Please try logging in again.');
      return;
    }
    
    if (!formData.customerId || !formData.serviceId || !formData.scheduledDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const jobData = {
        ...formData,
        userId: user.id
      };

      const result = await jobsAPI.create(jobData);
      
      setSuccessMessage('Job created successfully!');
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSave = async (customerData) => {
    if (!user?.id) return
    
    try {
      console.log("Saving customer:", customerData)
      const response = await customersAPI.create(customerData)
      console.log('Customer saved successfully:', response)
      
      const newCustomer = response.customer || response
      setCustomers(prev => [...prev, newCustomer]);
      handleCustomerSelect(newCustomer);
      
      // Return the customer data for navigation (though in createjob we don't navigate)
      return newCustomer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error // Re-throw to prevent modal from closing
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/jobs")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">Jobs</span>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Create Job</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or select customer..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {(filteredCustomers || []).map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </button>
                    ))}
                    {(filteredCustomers || []).length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No customers found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or select service..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    onFocus={() => setShowServiceDropdown(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {showServiceDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {(filteredServices || []).map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceSelect(service)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          ${service.price} • {service.duration} minutes
                        </div>
                      </button>
                    ))}
                    {(filteredServices || []).length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No services found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Team Member Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Team Member
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between"
                  >
                    <span className={selectedTeamMember ? "text-gray-900" : "text-gray-500"}>
                      {selectedTeamMember ? `${selectedTeamMember.first_name} ${selectedTeamMember.last_name}` : "Select team member..."}
                    </span>
                    {showTeamDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showTeamDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => handleTeamMemberSelect(null)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="font-medium">Unassigned</div>
                      </button>
                      {(teamMembers || []).map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleTeamMemberSelect(member)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{member.first_name} {member.last_name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </button>
                      ))}
                      {(teamMembers || []).length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No team members found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add any additional notes about this job..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isCustomerModalOpen && (
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSave={handleCustomerSave}
        />
      )}
    </div>
  );
}