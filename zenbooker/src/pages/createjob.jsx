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
  Award,
  Tag,
  Star,
  Zap,
  Shield,
  Target,
  Navigation,
  Package,
  Tool,
  Wrench,
  Paintbrush,
  Leaf,
  Sparkles,
  MoreVertical,
  ExternalLink,
  Printer,
  Send,
  Edit3,
  Copy,
  Menu,
  Building,
  Truck,
  Clipboard
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import MobileHeader from '../components/mobile-header';
import CustomerModal from "../components/customer-modal";
import ServiceModal from "../components/service-modal";
import ServiceAddressModal from "../components/service-address-modal";
import PaymentMethodModal from "../components/payment-method-modal";
import TerritorySelectionModal from "../components/territory-selection-modal";
import AddressAutocomplete from "../components/address-autocomplete";
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
    },
    // Additional fields for comprehensive job creation
    serviceName: "",
    invoiceStatus: "draft",
    paymentStatus: "pending",
    priority: "normal",
    estimatedDuration: 0,
    skills: [],
    specialInstructions: "",
    customerNotes: "",
    internalNotes: "",
    tags: [],
    attachments: [],
    recurringFrequency: "weekly",
    recurringEndDate: "",
    autoInvoice: true,
    autoReminders: true,
    customerSignature: false,
    photosRequired: false,
    qualityCheck: true
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
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]); // Multiple team members
  const [detectedTerritory, setDetectedTerritory] = useState(null);
  const [territories, setTerritories] = useState([]);
  const [territoriesLoading, setTerritoriesLoading] = useState(false);
  
  // Service modifiers and intake questions state
  const [selectedModifiers, setSelectedModifiers] = useState({}); // { modifierId: selectedOptions[] }
  const [intakeQuestionAnswers, setIntakeQuestionAnswers] = useState({}); // { questionId: answer }

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    serviceDetails: true,
    scheduling: true,
    pricing: true,
    team: false,
    contact: false,
    address: false,
    notes: false,
    advanced: false,
    notifications: false
  });

  // Status options
  const statusOptions = [
    { key: 'pending', label: 'Pending', color: 'bg-yellow-400' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-400' },
    { key: 'in-progress', label: 'In Progress', color: 'bg-orange-400' },
    { key: 'completed', label: 'Completed', color: 'bg-green-400' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400' }
  ];

  // Priority options
  const priorityOptions = [
    { key: 'low', label: 'Low', color: 'bg-gray-400' },
    { key: 'normal', label: 'Normal', color: 'bg-blue-400' },
    { key: 'high', label: 'High', color: 'bg-orange-400' },
    { key: 'urgent', label: 'Urgent', color: 'bg-red-400' }
  ];

  // Recurring frequency options
  const recurringOptions = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'bi-weekly', label: 'Bi-weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'yearly', label: 'Yearly' }
  ];

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
        total: total,
        serviceName: selectedService.name,
        estimatedDuration: selectedService.duration || 0
      }));
    }
  }, [selectedService, formData.discount, formData.additionalFees, formData.taxes]);

  // Monitor scheduledTime changes
  useEffect(() => {
    console.log('scheduledTime changed to:', formData.scheduledTime);
  }, [formData.scheduledTime]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setDataLoading(true);
      const [customersData, servicesData, teamData, territoriesData] = await Promise.all([
        customersAPI.getAll(user.id),
        servicesAPI.getAll(user.id),
        teamAPI.getAll(user.id),
        territoriesAPI.getAll(user.id)
      ]);
      
      setCustomers(customersData.customers || customersData);
      setServices(servicesData.services || servicesData);
      setTeamMembers(teamData.teamMembers || teamData);
      setTerritories(territoriesData.territories || territoriesData);
      setFilteredCustomers(customersData.customers || customersData);
      setFilteredServices(servicesData.services || servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    
    console.log('Customer selected:', customer);
    console.log('Customer address fields:', {
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip_code: customer.zip_code
    });
    
    // Use separate address fields if available, otherwise parse the address string
    let parsedAddress = {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    };
    
    if (customer.address || customer.city || customer.state || customer.zip_code) {
      // Use separate fields if available
      if (customer.city && customer.state && customer.zip_code) {
        parsedAddress.street = customer.address || "";
        parsedAddress.city = customer.city;
        parsedAddress.state = customer.state;
        parsedAddress.zipCode = customer.zip_code;
      } else if (customer.address) {
        // Fallback to parsing address string if separate fields aren't available
        const addressParts = customer.address.split(',').map(part => part.trim());
        
        console.log('Address parts:', addressParts);
        
        if (addressParts.length >= 1) {
          parsedAddress.street = addressParts[0];
        }
        
        if (addressParts.length >= 2) {
          parsedAddress.city = addressParts[1];
        }
        
        if (addressParts.length >= 3) {
          // Handle state and zip code which might be together like "State 12345"
          const stateZipPart = addressParts[2];
          const stateZipMatch = stateZipPart.match(/^([A-Za-z\s]+)\s+(\d{5}(?:-\d{4})?)$/);
          
          if (stateZipMatch) {
            parsedAddress.state = stateZipMatch[1].trim();
            parsedAddress.zipCode = stateZipMatch[2];
          } else {
            // If no zip code pattern, assume it's just state
            parsedAddress.state = stateZipPart;
          }
        }
      }
      
      console.log('Parsed address:', parsedAddress);
    }
    
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      contactInfo: {
        phone: customer.phone || "",
        email: customer.email || "",
        emailNotifications: true,
        textNotifications: false
      },
      // Autopopulate service address from customer address if available
      serviceAddress: (customer.address || customer.city || customer.state || customer.zip_code) ? parsedAddress : prev.serviceAddress
    }));
    setShowCustomerDropdown(false);
    setCustomerSearch("");
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    
    // Handle duration properly - services use { hours: X, minutes: Y } format
    let durationInHours = 1; // Default
    if (service.duration) {
      console.log('🔄 Service duration before conversion:', {
        duration: service.duration,
        type: typeof service.duration,
        isObject: typeof service.duration === 'object'
      });
      
      if (typeof service.duration === 'object' && service.duration.hours !== undefined) {
        // New format: { hours: X, minutes: Y }
        durationInHours = service.duration.hours + (service.duration.minutes / 60);
        console.log('🔄 Converted object duration to hours:', {
          hours: service.duration.hours,
          minutes: service.duration.minutes,
          totalHours: durationInHours
        });
      } else if (typeof service.duration === 'number') {
        // Old format: minutes as number
        durationInHours = service.duration / 60; // Don't use Math.ceil, keep decimal
        console.log('🔄 Converted number duration to hours:', {
          originalMinutes: service.duration,
          convertedHours: durationInHours
        });
      }
    }
    
    console.log('🔄 Final duration in hours for formData:', durationInHours);
    
    // Parse modifiers and intake questions if they exist
    let serviceModifiers = [];
    let serviceIntakeQuestions = [];
    
    if (service.modifiers) {
      try {
        serviceModifiers = typeof service.modifiers === 'string' 
          ? JSON.parse(service.modifiers) 
          : service.modifiers;
        
        // Debug modifier durations
        console.log('🔄 Service modifiers loaded:', serviceModifiers);
        serviceModifiers.forEach(modifier => {
          if (modifier.options) {
            modifier.options.forEach(option => {
              console.log(`🔄 Modifier option "${option.title}" duration:`, {
                duration: option.duration,
                type: typeof option.duration,
                isObject: typeof option.duration === 'object'
              });
            });
          }
        });
      } catch (error) {
        console.error('Error parsing service modifiers:', error);
        serviceModifiers = [];
      }
    }
    
    if (service.intake_questions) {
      try {
        serviceIntakeQuestions = typeof service.intake_questions === 'string' 
          ? JSON.parse(service.intake_questions) 
          : service.intake_questions;
      } catch (error) {
        console.error('Error parsing service intake questions:', error);
        serviceIntakeQuestions = [];
      }
    }
    
    setFormData(prev => ({
      ...prev,
      serviceId: service.id,
      price: service.price || 0,
      duration: durationInHours,
      workers: selectedTeamMembers.length > 0 ? selectedTeamMembers.length : (service.workers || 1),
      skillsRequired: service.skills || 0,
      serviceName: service.name,
      estimatedDuration: service.duration || 0,
      // Store service modifiers and intake questions for job creation
      serviceModifiers: serviceModifiers,
      serviceIntakeQuestions: serviceIntakeQuestions,
      // Calculate time based on service duration - default to 9 AM if no time set
      scheduledTime: prev.scheduledTime || "09:00"
    }));
    
    // Clear previous intake answers when selecting a new service
    setIntakeQuestionAnswers({});
    
    setShowServiceDropdown(false);
    setServiceSearch("");
  };

  const handleTeamMemberSelect = (member) => {
    setSelectedTeamMember(member);
    setFormData(prev => ({ ...prev, teamMemberId: member.id }));
    setShowTeamDropdown(false);
  };

  const handleMultipleTeamMemberSelect = (member) => {
    setSelectedTeamMembers(prev => {
      const isSelected = prev.find(m => m.id === member.id);
      let newSelectedMembers;
      
      if (isSelected) {
        // Remove if already selected
        newSelectedMembers = prev.filter(m => m.id !== member.id);
      } else {
        // Add if not selected
        newSelectedMembers = [...prev, member];
      }
      
      // Update workers field based on number of selected team members
      setFormData(formData => ({
        ...formData,
        workers: newSelectedMembers.length
      }));
      
      return newSelectedMembers;
    });
  };

  const removeTeamMember = (memberId) => {
    setSelectedTeamMembers(prev => {
      const newSelectedMembers = prev.filter(m => m.id !== memberId);
      
      // Update workers field based on number of selected team members
      setFormData(formData => ({
        ...formData,
        workers: newSelectedMembers.length
      }));
      
      return newSelectedMembers;
    });
  };

  const clearAllTeamMembers = () => {
    setSelectedTeamMembers([]);
    // Keep the current worker count when clearing team members
    // This allows manual adjustment after clearing team members
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submitted');
    console.log('Form data:', formData);
    console.log('User:', user);
    console.log('Submit button clicked - checking validation...');
    
    if (!user?.id) {
      setError('User not available. Please try logging in again.');
      return;
    }
    
    console.log('Form data before validation:', {
      customerId: formData.customerId,
      serviceId: formData.serviceId,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      scheduledTimeType: typeof formData.scheduledTime,
      scheduledTimeLength: formData.scheduledTime ? formData.scheduledTime.length : 'null/undefined'
    });
    
    if (!formData.customerId || !formData.serviceId || !formData.scheduledDate || !formData.scheduledTime) {
      console.log('Validation failed:', {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime
      });
      
      const missingFields = [];
      if (!formData.customerId) missingFields.push('Customer');
      if (!formData.serviceId) missingFields.push('Service');
      if (!formData.scheduledDate) missingFields.push('Date');
      if (!formData.scheduledTime) missingFields.push('Time');
      
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      // Prevent any input from being focused
      if (document.activeElement) {
        document.activeElement.blur();
      }
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!selectedCustomer) {
      setError('Please select a customer.');
      // Prevent any input from being focused
      if (document.activeElement) {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!selectedService) {
      setError('Please select a service.');
      // Prevent any input from being focused
      if (document.activeElement) {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        teamMemberId: selectedTeamMembers.length > 0 ? selectedTeamMembers[0].id : formData.teamMemberId, // Primary team member
        teamMemberIds: selectedTeamMembers.map(member => member.id), // All selected team members
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        status: formData.status,
        duration: parseInt(calculateTotalDuration() || 0) * 60 || 360, // Convert total hours to minutes
        workers: parseInt(formData.workers) || 1,
        skillsRequired: parseInt(formData.skillsRequired) || 0,
        price: parseFloat(calculateTotalPrice() || 0),
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
        serviceAddress: formData.serviceAddress,
        // Additional comprehensive fields
        serviceName: formData.serviceName,
        invoiceStatus: formData.invoiceStatus,
        paymentStatus: formData.paymentStatus,
        priority: formData.priority,
        estimatedDuration: formData.estimatedDuration,
        skills: formData.skills,
        specialInstructions: formData.specialInstructions,
        customerNotes: formData.customerNotes,
        tags: formData.tags,
        recurringFrequency: formData.recurringFrequency,
        recurringEndDate: formData.recurringEndDate,
        autoInvoice: formData.autoInvoice,
        autoReminders: formData.autoReminders,
        customerSignature: formData.customerSignature,
        photosRequired: formData.photosRequired,
        qualityCheck: formData.qualityCheck,
        // Service modifiers and intake questions
        selectedModifiers: selectedModifiers,
        intakeQuestionAnswers: intakeQuestionAnswers,
        totalPrice: calculateTotalPrice()
      };

      console.log('Creating job with data:', jobData);
      console.log('Time value being sent:', jobData.scheduledTime);
      console.log('Time value type:', typeof jobData.scheduledTime);
      console.log('Time value length:', jobData.scheduledTime ? jobData.scheduledTime.length : 'null/undefined');
      const result = await jobsAPI.create(jobData);
      console.log('Job creation result:', result);
      
      setSuccessMessage('Job created successfully!');
      setTimeout(() => {
        // Navigate to the specific job details page
        const jobId = result.id || result.job?.id || result.job_id;
        console.log('Navigating to job ID:', jobId);
        if (jobId) {
          navigate(`/job/${jobId}`);
        } else {
          // If no job ID returned, navigate to jobs page and refresh
          navigate('/jobs');
          // Force a page reload to ensure new job appears
          window.location.reload();
        }
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

  const handleAddressSave = (serviceAddress) => {
    setFormData(prev => ({ ...prev, serviceAddress }));
    setShowAddressModal(false);
  };

  const handlePaymentMethodSave = (paymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod }));
    setShowPaymentModal(false);
  };

  const handleTerritorySelect = (territory) => {
    setDetectedTerritory(territory);
    setFormData(prev => ({ ...prev, territory: territory.name, territoryId: territory.id }));
    setShowTerritoryModal(false);
  };

  // Handle modifier selections
  const handleModifierSelection = (modifierId, optionId, isSelected) => {
    console.log('🔄 Modifier selection:', { modifierId, optionId, isSelected });
    
    setSelectedModifiers(prev => {
      const currentSelections = prev[modifierId] || [];
      let newSelections;
      
      if (isSelected) {
        // Add option
        newSelections = [...currentSelections, optionId];
      } else {
        // Remove option
        newSelections = currentSelections.filter(id => id !== optionId);
      }
      
      const updatedSelections = {
        ...prev,
        [modifierId]: newSelections
      };
      
      console.log('🔄 Updated modifier selections:', updatedSelections);
      console.log('🔄 New total price:', calculateTotalPrice());
      console.log('🔄 New total duration:', calculateTotalDuration());
      
      return updatedSelections;
    });
  };

  // Handle intake question answers
  const handleIntakeQuestionAnswer = (questionId, answer) => {
    setIntakeQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Calculate total price including modifiers
  const calculateTotalPrice = () => {
    try {
      // Ensure basePrice is a number
      let basePrice = parseFloat(formData.price) || 0;
      let modifierPrice = 0;
      
      // Add prices from selected modifiers
      Object.entries(selectedModifiers).forEach(([modifierId, selectedOptionIds]) => {
        const modifier = formData.serviceModifiers?.find(m => m.id == modifierId);
        if (modifier) {
          selectedOptionIds.forEach(optionId => {
            const option = modifier.options?.find(o => o.id == optionId);
            if (option && option.price) {
              // Ensure option.price is a number
              const optionPrice = parseFloat(option.price) || 0;
              modifierPrice += optionPrice;
            }
          });
        }
      });
      
      const totalPrice = basePrice + modifierPrice;
      console.log('🔄 Price calculation:', { basePrice, modifierPrice, totalPrice });
      return totalPrice;
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0;
    }
  };

  // Calculate total duration including modifiers
  const calculateTotalDuration = () => {
    try {
      // Ensure baseDuration is a number (already in hours from service selection)
      let baseDuration = parseFloat(formData.duration) || 0;
      let modifierDuration = 0;
      
      // Add duration from selected modifiers
      Object.entries(selectedModifiers).forEach(([modifierId, selectedOptionIds]) => {
        const modifier = formData.serviceModifiers?.find(m => m.id == modifierId);
        if (modifier) {
          selectedOptionIds.forEach(optionId => {
            const option = modifier.options?.find(o => o.id == optionId);
            if (option && option.duration) {
              // Modifier durations are stored in minutes (from service-details.jsx)
              // Convert minutes to hours to match base duration format
              const optionDurationInMinutes = parseFloat(option.duration) || 0;
              const optionDurationInHours = optionDurationInMinutes / 60;
              
              modifierDuration += optionDurationInHours;
              
              console.log(`🔄 Modifier option "${option.label}" duration:`, {
                originalMinutes: optionDurationInMinutes,
                convertedHours: optionDurationInHours
              });
            }
          });
        }
      });
      
      const totalDuration = baseDuration + modifierDuration;
      console.log('🔄 Duration calculation:', { 
        baseDuration, 
        modifierDuration, 
        totalDuration,
        formDataDuration: formData.duration,
        selectedModifiersCount: Object.keys(selectedModifiers).length
      });
      return totalDuration;
    } catch (error) {
      console.error('Error calculating total duration:', error);
      return 0;
    }
  };

  // Show loading if user is not available
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/jobs')}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Jobs</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Job</h1>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-4 sm:mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6" noValidate>
            
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('basicInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  </div>
                  {expandedSections.basicInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.basicInfo && (
                <div className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {selectedCustomer && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </p>
                        <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {showCustomerDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowCustomerDropdown(false)}
                        />
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </button>
                        ))}
                      </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add New Customer
                  </button>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      onFocus={() => setShowServiceDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {selectedService && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {selectedService.image && (
                            <img 
                              src={selectedService.image} 
                              alt={selectedService.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-green-900">{selectedService.name}</p>
                            <p className="text-sm text-green-700">${selectedService.price}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {showServiceDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowServiceDropdown(false)}
                        />
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredServices.map(service => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceSelect(service)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-3">
                              {service.image && (
                                <img 
                                  src={service.image} 
                                  alt={service.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-600">${service.price}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add New Service
                  </button>
                </div>

                {/* Service Modifiers - Right after service selection */}
                {formData.serviceModifiers && formData.serviceModifiers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Service Options</h3>
                    {formData.serviceModifiers.map((modifier) => {
                      console.log('Modifier data:', modifier);
                      return (
                        <div key={modifier.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{modifier.title}</h4>
                            {modifier.required && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          {modifier.description && (
                            <p className="text-sm text-gray-600 mb-3">{modifier.description}</p>
                          )}
                          
                          {/* Single Selection */}
                          {modifier.selectionType === 'single' && (
                            <div className="space-y-2">
                              {modifier.options?.map((option) => {
                                console.log('Option data:', option);
                                return (
                                  <label key={option.id} className="flex items-center space-x-3">
                                    <input
                                      type="radio"
                                      name={`modifier-${modifier.id}`}
                                      value={option.id}
                                      checked={selectedModifiers[modifier.id]?.includes(option.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          handleModifierSelection(modifier.id, option.id, true);
                                        }
                                      }}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    {option.image && (
                                      <img
                                        src={option.image}
                                        alt={option.label || option.name}
                                        className="w-8 h-8 object-cover rounded-lg border border-gray-200"
                                      />
                                    )}
                                    <span className="text-sm text-gray-900">
                                      {option.label || option.name || `Option ${option.id}`}
                                    </span>
                                    {option.price > 0 && (
                                      <span className="text-sm text-green-600">+${option.price}</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Multi Selection */}
                          {modifier.selectionType === 'multi' && (
                            <div className="space-y-2">
                              {modifier.options?.map((option) => {
                                console.log('Option data:', option);
                                return (
                                  <label key={option.id} className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedModifiers[modifier.id]?.includes(option.id)}
                                      onChange={(e) => handleModifierSelection(modifier.id, option.id, e.target.checked)}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    {option.image && (
                                      <img
                                        src={option.image}
                                        alt={option.label || option.name}
                                        className="w-8 h-8 object-cover rounded-lg border border-gray-200"
                                      />
                                    )}
                                    <span className="text-sm text-gray-900">
                                      {option.label || option.name || `Option ${option.id}`}
                                    </span>
                                    {option.price > 0 && (
                                      <span className="text-sm text-green-600">+${option.price}</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Quantity Selection */}
                          {modifier.selectionType === 'quantity' && (
                            <div className="space-y-3">
                              {modifier.options?.map((option) => {
                                const currentQuantity = selectedModifiers[modifier.id]?.[option.id] || 0;
                                return (
                                  <div key={option.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex-1 flex items-center space-x-3">
                                      {option.image && (
                                        <img
                                          src={option.image}
                                          alt={option.label || option.name}
                                          className="w-8 h-8 object-cover rounded-lg border border-gray-200"
                                        />
                                      )}
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {option.label || option.name || `Option ${option.id}`}
                                        </span>
                                        {option.price > 0 && (
                                          <span className="text-sm text-green-600 ml-2">+${option.price} each</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (currentQuantity > 0) {
                                            handleModifierSelection(modifier.id, option.id, currentQuantity - 1);
                                          }
                                        }}
                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-medium">{currentQuantity}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleModifierSelection(modifier.id, option.id, currentQuantity + 1);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Intake Questions - Right after modifiers */}
                {formData.serviceIntakeQuestions && formData.serviceIntakeQuestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Customer Questions</h3>
                    {formData.serviceIntakeQuestions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{question.question}</h4>
                          {question.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          )}
                        </div>
                        {question.description && (
                          <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                        )}
                        
                        {/* Multiple Choice */}
                        {question.questionType === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <label key={option.id} className="flex items-center space-x-3">
                                <input
                                  type={question.selectionType === 'single' ? 'radio' : 'checkbox'}
                                  name={question.selectionType === 'single' ? `question-${question.id}` : undefined}
                                  checked={intakeQuestionAnswers[question.id]?.includes(option.id)}
                                  onChange={(e) => {
                                    const currentAnswers = intakeQuestionAnswers[question.id] || [];
                                    let newAnswers;
                                    if (question.selectionType === 'single') {
                                      newAnswers = e.target.checked ? [option.id] : [];
                                    } else {
                                      if (e.target.checked) {
                                        newAnswers = [...currentAnswers, option.id];
                                      } else {
                                        newAnswers = currentAnswers.filter(id => id !== option.id);
                                      }
                                    }
                                    setIntakeQuestionAnswers(prev => ({
                                      ...prev,
                                      [question.id]: newAnswers
                                    }));
                                  }}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">{option.text}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Dropdown */}
                        {question.questionType === 'dropdown' && (
                          <select
                            value={intakeQuestionAnswers[question.id] || ''}
                            onChange={(e) => {
                              setIntakeQuestionAnswers(prev => ({
                                ...prev,
                                [question.id]: e.target.value
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an option</option>
                            {question.options?.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.text}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Short Text */}
                        {question.questionType === 'short_text' && (
                          <input
                            type="text"
                            value={intakeQuestionAnswers[question.id] || ''}
                            onChange={(e) => {
                              setIntakeQuestionAnswers(prev => ({
                                ...prev,
                                [question.id]: e.target.value
                              }));
                            }}
                            placeholder="Enter your answer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}

                        {/* Long Text */}
                        {question.questionType === 'long_text' && (
                          <textarea
                            value={intakeQuestionAnswers[question.id] || ''}
                            onChange={(e) => {
                              setIntakeQuestionAnswers(prev => ({
                                ...prev,
                                [question.id]: e.target.value
                              }));
                            }}
                            placeholder="Enter your answer"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status.key} value={status.key}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority.key} value={priority.key}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scheduling Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('scheduling')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Scheduling</h2>
                  </div>
                  {expandedSections.scheduling ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.scheduling && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                        onChange={(e) => {
                          console.log('Time input changed:', e.target.value);
                          console.log('Previous scheduledTime:', formData.scheduledTime);
                          setFormData(prev => {
                            console.log('Setting scheduledTime to:', e.target.value);
                            return { ...prev, scheduledTime: e.target.value };
                          });
                        }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="1800"
                      />
                    </div>

                    {/* Recurring Job */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.recurringJob}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringJob: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Recurring Job</span>
                      </label>
                    </div>

                    {/* Recurring Frequency */}
                    {formData.recurringJob && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                        <select
                          value={formData.recurringFrequency}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {recurringOptions.map(option => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Recurring End Date */}
                    {formData.recurringJob && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Service Details Section */}
            {selectedService && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleSection('serviceDetails')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
                    </div>
                    {expandedSections.serviceDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                
                {expandedSections.serviceDetails && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* Service Info Chips */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {(calculateTotalDuration() || 0).toFixed(1)} hr
                          {(calculateTotalDuration() || 0) !== (parseFloat(formData.duration) || 0) && (
                            <span className="text-xs text-blue-600 ml-1">
                              (base: {(parseFloat(formData.duration) || 0).toFixed(1)} + modifiers: {((calculateTotalDuration() || 0) - (parseFloat(formData.duration) || 0)).toFixed(1)})
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, duration: prev.duration + 0.5 }))}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          ${(calculateTotalPrice() || 0).toFixed(2)}
                          {(calculateTotalPrice() || 0) !== (parseFloat(formData.price) || 0) && (
                            <span className="text-xs text-blue-600 ml-1">
                              (base: ${(parseFloat(formData.price) || 0).toFixed(2)} + modifiers: ${((calculateTotalPrice() || 0) - (parseFloat(formData.price) || 0)).toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {selectedTeamMembers.length > 0 
                            ? `${selectedTeamMembers.length} worker${selectedTeamMembers.length !== 1 ? 's' : ''} (from team)`
                            : `${formData.workers} worker${formData.workers !== 1 ? 's' : ''} (manual)`}
                        </span>
                        {selectedTeamMembers.length === 0 && (
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, workers: prev.workers + 1 }))}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            title="Add worker manually"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        {selectedTeamMembers.length > 0 && (
                          <span className="ml-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Auto
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{formData.skillsRequired || 0} skills required</span>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, skillsRequired: (prev.skillsRequired || 0) + 1 }))}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                      <textarea
                        rows={3}
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        placeholder="Any special instructions for this job..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('notes')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Notes & Communication</h2>
                  </div>
                  {expandedSections.notes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.notes && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Notes (Customer Visible)</label>
                      <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add notes that will be visible to the customer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes (Team Only)</label>
                      <textarea
                        rows={4}
                        value={formData.internalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                        placeholder="Add internal notes for your team..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Team Assignment Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('team')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Team Assignment</h2>
                  </div>
                  {expandedSections.team ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.team && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Team Members
                        <span className="text-xs text-gray-500 ml-1">(Worker count will be set automatically)</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {selectedTeamMembers.length > 0 
                            ? `${selectedTeamMembers.length} member(s) selected` 
                            : "Select team members..."}
                        </button>
                        {showTeamDropdown && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowTeamDropdown(false)}
                            />
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {teamMembers.map(member => {
                                const isSelected = selectedTeamMembers.find(m => m.id === member.id);
                                return (
                                  <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => handleMultipleTeamMemberSelect(member)}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                      isSelected ? 'bg-blue-50 text-blue-700' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                                        <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
                    </div>
                                      {isSelected && (
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                  </div>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Show selected team members */}
                      {selectedTeamMembers.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">Selected Team Members:</p>
                            <button
                              type="button"
                              onClick={clearAllTeamMembers}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="space-y-2">
                            {selectedTeamMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="text-sm">{member.first_name} {member.last_name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTeamMember(member.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                      <button
                        type="button"
                        onClick={() => setShowTerritoryModal(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {detectedTerritory ? detectedTerritory.name : "Select territory..."}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
              
              {/* Schedule Type Buttons */}
              <div className="flex space-x-2 mb-6">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'one-time' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.scheduleType === 'one-time'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  One Time
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'recurring' }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.scheduleType === 'recurring'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Recurring Job
                </button>
              </div>

              {/* Schedule Now Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <h3 className="text-sm font-medium text-gray-900">Schedule Now</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <div className="relative">
                  <input
                        type="date"
                        required
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <div className="relative">
                  <input
                        type="time"
                        required
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="900"
                        min="00:00"
                        max="23:59"
                  />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                </div>
                
              {/* Recurring Options */}
              {formData.scheduleType === 'recurring' && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Frequency</label>
                  <select
                    value={formData.recurringFrequency || "weekly"}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('contact')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  </div>
                  {expandedSections.contact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.contact && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="customer@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={formData.contactInfo.emailNotifications}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, emailNotifications: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                          Email notifications
                        </label>
                </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="textNotifications"
                          checked={formData.contactInfo.textNotifications}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contactInfo: { ...prev.contactInfo, textNotifications: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="textNotifications" className="text-sm text-gray-700">
                          SMS notifications
                        </label>
              </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Address Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleSection('address')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Service Address</h2>
                  </div>
                  {expandedSections.address ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {expandedSections.address && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <AddressAutocomplete
                        value={formData.serviceAddress.street}
                        onChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          serviceAddress: { ...prev.serviceAddress, street: value }
                        }))}
                        onAddressSelect={(addressComponents) => {
                          console.log('Address selected:', addressComponents);
                          setFormData(prev => ({
                            ...prev,
                            serviceAddress: {
                              ...prev.serviceAddress,
                              ...addressComponents
                            }
                          }));
                        }}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.serviceAddress.city}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          serviceAddress: { ...prev.serviceAddress, city: e.target.value }
                        }))}
                        placeholder="New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.serviceAddress.state}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          serviceAddress: { ...prev.serviceAddress, state: e.target.value }
                        }))}
                        placeholder="NY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={formData.serviceAddress.zipCode}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          serviceAddress: { ...prev.serviceAddress, zipCode: e.target.value }
                        }))}
                        placeholder="10001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.serviceAddress.country}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          serviceAddress: { ...prev.serviceAddress, country: e.target.value }
                        }))}
                        placeholder="United States"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Use Address Modal
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={() => console.log('Submit button clicked')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleCustomerSave}
        user={user}
      />
      
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={(newService) => {
          // Add the new service to the services list
          setServices(prev => [...prev, newService]);
          // Select the newly created service
          handleServiceSelect(newService);
          // Close the modal
          setIsServiceModalOpen(false);
        }}
        user={user}
      />
      
      <ServiceAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        address={formData.serviceAddress}
      />
      
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handlePaymentMethodSave}
        paymentMethod={formData.paymentMethod}
      />
      
      <TerritorySelectionModal
        isOpen={showTerritoryModal}
        onClose={() => setShowTerritoryModal(false)}
        onSelect={handleTerritorySelect}
        territories={territories}
        user={user}
      />
    </div>
  );
}