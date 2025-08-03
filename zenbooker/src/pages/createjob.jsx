"use client"

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronDown, 
  ChevronUp,
  User,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import MobileHeader from '../components/mobile-header';
import CustomerModal from "../components/customer-modal";
import { useNavigate } from 'react-router-dom';
import { jobsAPI, customersAPI, servicesAPI, teamAPI, territoriesAPI } from '../services/api';
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
  const [detectedTerritory, setDetectedTerritory] = useState(null);

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
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
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

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
    setShowCustomerDropdown(false);
    
    // Detect territory based on customer location
    if (customer.zip_code || customer.address) {
      try {
        const territoryResponse = await territoriesAPI.detectTerritory(
          user.id,
          customer.address,
          customer.zip_code
        );
        
        if (territoryResponse.available && territoryResponse.territory) {
          setDetectedTerritory(territoryResponse.territory);
          console.log('Detected territory:', territoryResponse.territory);
        } else {
          setDetectedTerritory(null);
        }
      } catch (error) {
        console.error('Error detecting territory:', error);
        setDetectedTerritory(null);
      }
    }
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/jobs")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Jobs</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
                <p className="text-gray-600 mt-1">Schedule a new service appointment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                    <p className="text-gray-600 text-sm">Select or create a new customer</p>
                  </div>
                </div>

                                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-3">
                       Customer *
                     </label>
                     <div className="relative">
                       <input
                         type="text"
                         placeholder="Search for a customer..."
                         value={customerSearch}
                         onChange={(e) => setCustomerSearch(e.target.value)}
                         onFocus={() => setShowCustomerDropdown(true)}
                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 transition-all duration-200"
                       />
                       <button
                         type="button"
                         onClick={() => setIsCustomerModalOpen(true)}
                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                       >
                         <Plus className="w-5 h-5" />
                       </button>

                       {showCustomerDropdown && (
                         <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                           {(filteredCustomers || []).map((customer) => (
                             <button
                               key={customer.id}
                               type="button"
                               onClick={() => handleCustomerSelect(customer)}
                               className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                             >
                               <div className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</div>
                               <div className="text-sm text-gray-500">{customer.email}</div>
                             </button>
                           ))}
                           {(filteredCustomers || []).length === 0 && (
                             <div className="px-4 py-3 text-gray-500">No customers found</div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>

                  {/* Territory Detection */}
                  {detectedTerritory && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            Detected Territory: {detectedTerritory.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            {detectedTerritory.location} • {detectedTerritory.radius_miles} mile radius
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
                    <p className="text-gray-600 text-sm">Choose the service to be performed</p>
                  </div>
                </div>

                                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-3">
                     Service *
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       placeholder="Search for a service..."
                       value={serviceSearch}
                       onChange={(e) => setServiceSearch(e.target.value)}
                       onFocus={() => setShowServiceDropdown(true)}
                       className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 placeholder-gray-500 transition-all duration-200"
                     />

                     {showServiceDropdown && (
                       <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                         {(filteredServices || []).map((service) => (
                           <button
                             key={service.id}
                             type="button"
                             onClick={() => handleServiceSelect(service)}
                             className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                           >
                             <div className="font-medium text-gray-900">{service.name}</div>
                             <div className="text-sm text-gray-500">
                               ${service.price} • {service.duration} minutes
                             </div>
                           </button>
                         ))}
                         {(filteredServices || []).length === 0 && (
                           <div className="px-4 py-3 text-gray-500">No services found</div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
              </div>

              {/* Scheduling Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Schedule & Assignment</h2>
                    <p className="text-gray-600 text-sm">Set the date, time, and assign team member</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 transition-all duration-200"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 transition-all duration-200"
                    />
                  </div>

                  {/* Team Member */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Assign to Team Member
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-left focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none flex items-center justify-between transition-all duration-200"
                      >
                        <span className={selectedTeamMember ? "text-gray-900" : "text-gray-500"}>
                          {selectedTeamMember ? `${selectedTeamMember.first_name} ${selectedTeamMember.last_name}` : "Select team member..."}
                        </span>
                        {showTeamDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showTeamDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleTeamMemberSelect(null)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200"
                          >
                            <div className="font-medium text-gray-900">Unassigned</div>
                          </button>
                          {(teamMembers || []).map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => handleTeamMemberSelect(member)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                            >
                              <div className="font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                              <div className="text-sm text-gray-500">{member.role}</div>
                            </button>
                          ))}
                          {(teamMembers || []).length === 0 && (
                            <div className="px-4 py-3 text-gray-500">No team members found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
                    <p className="text-gray-600 text-sm">Add any special instructions or details</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    placeholder="Add any additional notes about this job..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/jobs")}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Job...</span>
                      </div>
                    ) : (
                      'Create Job'
                    )}
                  </button>
                </div>
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