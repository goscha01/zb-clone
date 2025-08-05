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
  ArrowLeft,
  Edit,
  DollarSign,
  Calculator,
  Phone,
  Mail,
  Home,
  CreditCard,
  Bell,
  UserCheck,
  Settings,
  Info,
  Trash2,
  MessageSquare,
  Paperclip,
  Award
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import MobileHeader from '../components/mobile-header';
import CustomerModal from "../components/customer-modal";
import ServiceModal from "../components/service-modal";
import EditJobDetailsModal from "../components/edit-job-details-modal";
import ServiceAddressModal from "../components/service-address-modal";
import PaymentMethodModal from "../components/payment-method-modal";
import { useNavigate } from 'react-router-dom';
import { jobsAPI, customersAPI, servicesAPI, teamAPI, territoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showWorkersModal, setShowWorkersModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customerId: "",
    serviceId: "",
    teamMemberId: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    notes: "",
    status: "pending",
    duration: 6,
    workers: 1,
    skillsRequired: 0,
    price: 0,
    discount: 0,
    additionalFees: 0,
    taxes: 0,
    total: 0,
    paymentMethod: "",
    territory: "",
    recurringJob: false,
    scheduleType: "one-time",
    letCustomerSchedule: false,
    offerToProviders: false,
    internalNotes: "",
    serviceAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    },
    contactInfo: {
      phone: "",
      email: "",
      emailNotifications: true,
      textNotifications: false
    }
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
  const [territories, setTerritories] = useState([]);
  const [territoriesLoading, setTerritoriesLoading] = useState(false);

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    contactInfo: false,
    notes: false,
    notifications: true
  });

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

  useEffect(() => {
    // Update price calculations
    if (selectedService) {
      const basePrice = selectedService.price || 0;
      const discount = formData.discount || 0;
      const additionalFees = formData.additionalFees || 0;
      const taxes = formData.taxes || 0;
      
      const subtotal = basePrice - discount + additionalFees;
      const total = subtotal + taxes;
      
      setFormData(prev => ({ 
        ...prev, 
        price: basePrice,
        total: total
      }));
    }
  }, [selectedService, formData.discount, formData.additionalFees, formData.taxes]);

  // Show loading if user is not available
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
      setDataLoading(true);
      const [customersData, servicesData, teamData, territoriesData] = await Promise.all([
        customersAPI.getAll(user.id),
        servicesAPI.getAll(user.id),
        teamAPI.getAll(user.id),
        territoriesAPI.getAll(user.id)
      ]);

      console.log('Team data received:', teamData);

      // Ensure we have arrays, even if API returns unexpected format
      const customersArray = Array.isArray(customersData) ? customersData : [];
      const servicesArray = Array.isArray(servicesData) ? servicesData : [];
      const teamArray = Array.isArray(teamData) ? teamData : (teamData?.teamMembers || teamData || []);
      const territoriesArray = territoriesData?.territories || [];

      setCustomers(customersArray);
      setServices(servicesArray);
      setTeamMembers(teamArray);
      setTerritories(territoriesArray);
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
    } finally {
      setDataLoading(false);
    }
  };

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ 
      ...prev, 
      customerId: customer.id,
      contactInfo: {
        ...prev.contactInfo,
        phone: customer.phone || "",
        email: customer.email || ""
      }
    }));
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
          setFormData(prev => ({ ...prev, territory: territoryResponse.territory.name }));
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
    const durationInHours = Math.floor((service.duration || 360) / 60); // Convert minutes to hours
    const basePrice = service.price || 0;
    
    setFormData(prev => {
      const subtotal = basePrice - (prev.discount || 0) + (prev.additionalFees || 0);
      const total = subtotal + (prev.taxes || 0);
      
      return {
      ...prev, 
      serviceId: service.id,
        price: basePrice,
        duration: durationInHours,
        total: total
      };
    });
    
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
      setError('Please fill in all required fields: Customer, Service, and Date.');
      return;
    }

    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }

    if (!selectedService) {
      setError('Please select a service.');
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Prepare job data with proper field mapping
      const jobData = {
        userId: user.id,
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        teamMemberId: formData.teamMemberId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        notes: formData.notes, // Customer notes
        internalNotes: formData.internalNotes,
        status: formData.status,
        duration: parseInt(formData.duration) * 60 || 360, // Convert hours to minutes
        workers: parseInt(formData.workers) || 1,
        skillsRequired: parseInt(formData.skillsRequired) || 0,
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        additionalFees: parseFloat(formData.additionalFees) || 0,
        taxes: parseFloat(formData.taxes) || 0,
        total: parseFloat(formData.total) || 0,
        paymentMethod: formData.paymentMethod,
        territory: formData.territory,
        territoryId: formData.territoryId || detectedTerritory?.id || null,
        recurringJob: Boolean(formData.recurringJob),
        scheduleType: formData.scheduleType || 'one-time',
        letCustomerSchedule: Boolean(formData.letCustomerSchedule),
        offerToProviders: Boolean(formData.offerToProviders),
        contactInfo: formData.contactInfo,
        serviceAddress: formData.serviceAddress
      };

      console.log('Creating job with data:', jobData);
      const result = await jobsAPI.create(jobData);
      
      setSuccessMessage('Job created successfully!');
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (error) {
      console.error('Error creating job:', error);
      setError(error.response?.data?.error || 'Failed to create job. Please try again.');
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
      
      return newCustomer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error // Re-throw to prevent modal from closing
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Modal handlers
  const handleDurationSave = (duration) => {
    setFormData(prev => ({ ...prev, duration }));
  };

  const handleWorkersSave = (workers) => {
    setFormData(prev => ({ ...prev, workers }));
  };

  const handleSkillsSave = (skillsRequired) => {
    setFormData(prev => ({ ...prev, skillsRequired }));
  };

  const handleAddressSave = (serviceAddress) => {
    setFormData(prev => ({ ...prev, serviceAddress }));
  };

  const handlePaymentMethodSave = (paymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod }));
  };

  const handleTerritorySelect = (territory) => {
    setFormData(prev => ({ 
      ...prev, 
      territory: territory.name,
      territoryId: territory.id 
    }));
    setDetectedTerritory(territory);
    setShowTerritoryModal(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6 py-4 sm:py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => navigate("/jobs")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back to Jobs</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Create New Job</h1>
                <p className="text-gray-600 mt-1 text-sm hidden sm:block">Schedule a new service appointment</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="px-3 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-3 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base whitespace-nowrap"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Creating...</span>
                  </div>
                ) : (
                  <span>Schedule Job</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Messages */}
          {error && (
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {dataLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading form data...</p>
              </div>
            </div>
          ) : (
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Left Column */}
              <div className="flex-1 space-y-6 min-w-0">
                {/* Customer Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Customer</h2>
                    <button 
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for a customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

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
                            <div className="px-4 py-3 text-gray-500">
                              {customerSearch ? 'No customers found matching your search' : 'No customers available'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedCustomer && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-green-900">
                              {selectedCustomer.first_name} {selectedCustomer.last_name}
                            </p>
                            <p className="text-xs text-green-700">
                              {selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Territory Detection */}
                    {detectedTerritory && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">SERVICE</h2>
                    <h2 className="text-lg font-semibold">PRICE</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for a service..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        onFocus={() => setShowServiceDropdown(true)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setIsServiceModalOpen(true)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700 transition-colors duration-200"
                        title="Create Service"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

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
                                ${service.price} • {Math.floor((service.duration || 0) / 60)}h {(service.duration || 0) % 60}m
                              </div>
                            </button>
                          ))}
                          {(filteredServices || []).length === 0 && (
                            <div className="px-4 py-3 text-gray-500">
                              {serviceSearch ? 'No services found matching your search' : 'No services available'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Service Display */}
                    {selectedService && (
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-medium text-blue-600 break-words">{selectedService.name}</h3>
                            <button className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
                              Show details <ChevronDown className="w-3 h-3 inline ml-1" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-lg font-medium">
                              ${Number(selectedService.price || 0).toFixed(2)}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedService(null);
                                setServiceSearch("");
                                setFormData(prev => ({ ...prev, serviceId: "", price: 0 }));
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing Breakdown */}
                    {selectedService && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Subtotal</span>
                          <span>${(formData.price - formData.discount + formData.additionalFees).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <button className="text-blue-600 text-sm hover:text-blue-700 text-left">Add Discount</button>
                          <button className="text-blue-600 text-sm hover:text-blue-700 text-left sm:text-right">Add Fee</button>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <div className="flex items-center space-x-1">
                            <span>Taxes</span>
                            <Info className="w-4 h-4 text-gray-400" />
                          </div>
                          <span>${formData.taxes.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between font-semibold pt-2 border-t text-sm sm:text-base">
                          <span>Total</span>
                          <span>${formData.total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowDurationModal(true)}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm whitespace-nowrap">{formData.duration} hr</span>
                      <Edit className="w-3 h-3 text-gray-500" />
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowWorkersModal(true)}>
                      <Users className="w-4 h-4" />
                      <span className="text-sm whitespace-nowrap">{formData.workers} worker{formData.workers !== 1 ? 's' : ''}</span>
                      <Edit className="w-3 h-3 text-gray-500" />
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowSkillsModal(true)}>
                      <span className="text-sm whitespace-nowrap">{formData.skillsRequired} skills required</span>
                      <Edit className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold mb-4">Schedule</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${
                        formData.scheduleType === 'one-time' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'one-time' }))}
                    >
                      One Time
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${
                        formData.scheduleType === 'recurring' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'recurring' }))}
                    >
                      Recurring Job
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">Schedule Now</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                        <input
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                        <input
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 border border-gray-200 rounded-xl">
                    <div className="flex items-start space-x-2 mb-2">
                      <input 
                        type="checkbox" 
                        checked={formData.letCustomerSchedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, letCustomerSchedule: e.target.checked }))}
                        className="rounded border-gray-300 mt-0.5 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base">Let Customer Schedule</span>
                          <button className="text-purple-600 text-sm whitespace-nowrap">Upgrade</button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Send a bookable estimate to your customer, allowing them to choose a convenient time for the service.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-sm text-gray-600">ASSIGNED</h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-left focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none flex items-center justify-between transition-all duration-200"
                      >
                        <span className={selectedTeamMember ? "text-gray-900" : "text-gray-500"}>
                          {selectedTeamMember ? `${selectedTeamMember.first_name} ${selectedTeamMember.last_name}` : "Select team member..."}
                        </span>
                        {showTeamDropdown ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>

                      {showTeamDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleTeamMemberSelect(null)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200"
                          >
                            <div className="text-gray-500">Unassigned</div>
                          </button>
                          {(teamMembers || []).map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => handleTeamMemberSelect(member)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                            >
                              <div className="font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{member.role || 'Team Member'}</div>
                            </button>
                          ))}
                          {(teamMembers || []).length === 0 && (
                            <div className="px-4 py-3 text-gray-500">No team members found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-xl">
                    <div className="flex items-start space-x-2 mb-2">
                      <input 
                        type="checkbox" 
                        checked={formData.offerToProviders}
                        onChange={(e) => setFormData(prev => ({ ...prev, offerToProviders: e.target.checked }))}
                        className="rounded border-gray-300 mt-0.5 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base">Offer to Service Providers</span>
                          <button className="text-purple-600 text-sm whitespace-nowrap">Upgrade</button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      Allow qualified service providers in your network to accept this job.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full xl:w-80 space-y-6 flex-shrink-0">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <button
                    onClick={() => toggleSection('contactInfo')}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <h2 className="text-lg font-semibold">Contact Information</h2>
                    {expandedSections.contactInfo ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  
                  {expandedSections.contactInfo && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="customer@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <button
                    onClick={() => toggleSection('notifications')}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    {expandedSections.notifications ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  
                  {expandedSections.notifications && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium">Email Notifications</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.contactInfo.emailNotifications}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, emailNotifications: e.target.checked }
                          }))}
                          className="rounded border-gray-300"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium">Text Notifications</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.contactInfo.textNotifications}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, textNotifications: e.target.checked }
                          }))}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Service Address</h2>
                    <button 
                      onClick={() => setShowAddressModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.serviceAddress.street ? (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{formData.serviceAddress.street}</p>
                            <p className="text-xs text-gray-500">
                              {formData.serviceAddress.city}, {formData.serviceAddress.state} {formData.serviceAddress.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 border border-dashed border-gray-300 rounded-xl text-center">
                        <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No service address set</p>
                        <button 
                          onClick={() => setShowAddressModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                        >
                          Add address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Territory Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Territory</h2>
                    <button 
                      onClick={() => setShowTerritoryModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {formData.territory ? 'Change' : 'Select'}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.territory ? (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{formData.territory}</p>
                            {detectedTerritory && (
                              <p className="text-xs text-gray-500">
                                {detectedTerritory.location} • {detectedTerritory.radius_miles} mile radius
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 border border-dashed border-gray-300 rounded-xl text-center">
                        <MapPin className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No territory selected</p>
                        <button 
                          onClick={() => setShowTerritoryModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                        >
                          Select territory
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <button
                    onClick={() => toggleSection('notes')}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <h2 className="text-lg font-semibold">Notes</h2>
                    {expandedSections.notes ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  
                  {expandedSections.notes && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                        <textarea
                          value={formData.internalNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                          rows={4}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                          placeholder="Add any internal notes about this job..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                          placeholder="Notes visible to customer..."
                        />
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Paperclip className="w-4 h-4" />
                        <span>Attach files (coming soon)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Payment Method</h2>
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {formData.paymentMethod ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.paymentMethod ? (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          {formData.paymentMethod === 'cash' && <DollarSign className="w-5 h-5 text-gray-500" />}
                          {formData.paymentMethod === 'card' && <CreditCard className="w-5 h-5 text-gray-500" />}
                          {formData.paymentMethod === 'check' && <FileText className="w-5 h-5 text-gray-500" />}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 capitalize">{formData.paymentMethod}</p>
                            <p className="text-xs text-gray-500">Payment method selected</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 border border-dashed border-gray-300 rounded-xl text-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No payment method selected</p>
                        <button 
                          onClick={() => setShowPaymentModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                        >
                          Add payment method
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold mb-4">Job Status</h2>
                  
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Click outside handlers */}
      {showCustomerDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowCustomerDropdown(false)}
        />
      )}
      {showServiceDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowServiceDropdown(false)}
        />
      )}
      {showTeamDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowTeamDropdown(false)}
        />
      )}

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleCustomerSave}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={async (serviceData) => {
          if (!user?.id) return;
          
          try {
            const response = await servicesAPI.create(serviceData);
            const newService = response.service || response;
            setServices(prev => [...prev, newService]);
            handleServiceSelect(newService);
            return newService;
          } catch (error) {
            console.error('Error creating service:', error);
            throw error;
          }
        }}
      />

      {/* Job Details Modals */}
      <EditJobDetailsModal
        isOpen={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        onSave={handleDurationSave}
        type="duration"
        currentValue={formData.duration}
        title="Job Duration"
        icon={Clock}
      />

      <EditJobDetailsModal
        isOpen={showWorkersModal}
        onClose={() => setShowWorkersModal(false)}
        onSave={handleWorkersSave}
        type="workers"
        currentValue={formData.workers}
        title="Number of Workers"
        icon={Users}
      />

      <EditJobDetailsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onSave={handleSkillsSave}
        type="skills"
        currentValue={formData.skillsRequired}
        title="Skills Required"
        icon={Award}
      />

      {/* Service Address Modal */}
      <ServiceAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        currentAddress={formData.serviceAddress}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handlePaymentMethodSave}
        currentMethod={formData.paymentMethod}
      />

      {/* Territory Selection Modal */}
      {showTerritoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Select Territory</h2>
              </div>
              <button
                onClick={() => setShowTerritoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {territoriesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading territories...</p>
                </div>
              ) : territories.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {territories.map((territory) => (
                    <button
                      key={territory.id}
                      type="button"
                      onClick={() => handleTerritorySelect(territory)}
                      className="w-full p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="font-medium text-gray-900">{territory.name}</div>
                      {territory.location && (
                        <div className="text-sm text-gray-500 mt-1">{territory.location}</div>
                      )}
                      {territory.description && (
                        <div className="text-sm text-gray-500 mt-1">{territory.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No territories available</p>
                  <p className="text-sm text-gray-400 mt-1">Create territories first in the Territories section</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTerritoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}