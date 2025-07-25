"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, DollarSign, FileText, AlertCircle, Loader2 } from "lucide-react"
import { customersAPI, jobsAPI, estimatesAPI, invoicesAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import JobDetailsModal from "../components/job-details-modal"

const CustomerDetails = () => {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [jobs, setJobs] = useState([])
  const [estimates, setEstimates] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (customerId && user?.id) {
      fetchCustomerData()
    }
  }, [customerId, user?.id])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch customer details
      const customerData = await customersAPI.getById(customerId)
      setCustomer(customerData)

      // Fetch related data with server-side filtering
      const [jobsData, estimatesData, invoicesData] = await Promise.all([
        jobsAPI.getAll(user.id, "", "", 1, 50, "", "", "scheduled_date", "DESC", "", "", customerId),
        estimatesAPI.getAll(user.id, { customerId: customerId }),
        invoicesAPI.getAll(user.id, { customerId: customerId })
      ])

      // Use the filtered data directly from the server
      setJobs(jobsData.jobs || jobsData)
      setEstimates(estimatesData.estimates || estimatesData)
      setInvoices(invoicesData.invoices || invoicesData)

    } catch (error) {
      console.error('Error fetching customer data:', error)
      setError("Failed to load customer data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCustomer = () => {
    // Navigate to edit customer page or open edit modal
    navigate(`/customer/${customerId}/edit`)
  }

  const handleDeleteCustomer = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCustomer = async () => {
    try {
      setDeleteLoading(true)
      await customersAPI.delete(customerId)
      navigate('/customers')
    } catch (error) {
      console.error('Error deleting customer:', error)
      setError("Failed to delete customer.")
      setShowDeleteConfirm(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setIsJobModalOpen(true)
  }

  const handleJobModalClose = () => {
    setIsJobModalOpen(false)
    setSelectedJob(null)
  }

  const handleJobUpdate = () => {
    // Refresh customer data when job is updated
    fetchCustomerData()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/customers')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/customers')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate('/customers')}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Customers
                      </button>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </h1>
                        <p className="text-sm text-gray-500">Customer Details</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleEditCustomer}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteCustomer}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Information */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                    
                    <div className="space-y-4">
                      {customer.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">{customer.email}</span>
                        </div>
                      )}
                      
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">{customer.phone}</span>
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                          <span className="text-sm text-gray-900">{customer.address}</span>
                        </div>
                      )}
                      
                      {customer.notes && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                          <p className="text-sm text-gray-600">{customer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Tabs */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8 px-6">
                        <button
                          onClick={() => setActiveTab("overview")}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "overview"
                              ? "border-primary-500 text-primary-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setActiveTab("jobs")}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "jobs"
                              ? "border-primary-500 text-primary-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Jobs ({jobs.length})
                        </button>
                        <button
                          onClick={() => setActiveTab("estimates")}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "estimates"
                              ? "border-primary-500 text-primary-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Estimates ({estimates.length})
                        </button>
                        <button
                          onClick={() => setActiveTab("invoices")}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "invoices"
                              ? "border-primary-500 text-primary-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Invoices ({invoices.length})
                        </button>
                      </nav>
                    </div>

                    <div className="p-6">
                      {/* Overview Tab */}
                      {activeTab === "overview" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center">
                                <Calendar className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-blue-600">Total Jobs</p>
                                  <p className="text-2xl font-bold text-blue-900">{jobs.length}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="flex items-center">
                                <FileText className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-green-600">Total Estimates</p>
                                  <p className="text-2xl font-bold text-green-900">{estimates.length}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center">
                                <DollarSign className="w-8 h-8 text-purple-600" />
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-purple-600">Total Invoices</p>
                                  <p className="text-2xl font-bold text-purple-900">{invoices.length}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {jobs.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Jobs</h3>
                              <div className="space-y-3">
                                {jobs.slice(0, 3).map((job) => (
                                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-900">{job.service_name}</p>
                                      <p className="text-sm text-gray-500">{formatDate(job.scheduled_date)}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                      {job.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Jobs Tab */}
                      {activeTab === "jobs" && (
                        <div>
                          {jobs.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No jobs found for this customer.</p>
                          ) : (
                            <div className="space-y-3">
                              {jobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">{job.service_name}</p>
                                    <p className="text-sm text-gray-500">{formatDate(job.scheduled_date)}</p>
                                    {job.notes && <p className="text-sm text-gray-500 mt-1">{job.notes}</p>}
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                      {job.status.replace('_', ' ')}
                                    </span>
                                    <button
                                      onClick={() => handleViewJob(job)}
                                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Estimates Tab */}
                      {activeTab === "estimates" && (
                        <div>
                          {estimates.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No estimates found for this customer.</p>
                          ) : (
                            <div className="space-y-3">
                              {estimates.map((estimate) => (
                                <div key={estimate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">Estimate #{estimate.id}</p>
                                    <p className="text-sm text-gray-500">{formatDate(estimate.created_at)}</p>
                                    <p className="text-sm text-gray-500">{formatCurrency(estimate.total_amount)}</p>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(estimate.status)}`}>
                                      {estimate.status}
                                    </span>
                                    <button
                                      onClick={() => navigate(`/estimates/${estimate.id}`)}
                                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Invoices Tab */}
                      {activeTab === "invoices" && (
                        <div>
                          {invoices.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No invoices found for this customer.</p>
                          ) : (
                            <div className="space-y-3">
                              {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">Invoice #{invoice.id}</p>
                                    <p className="text-sm text-gray-500">{formatDate(invoice.created_at)}</p>
                                    <p className="text-sm text-gray-500">{formatCurrency(invoice.total_amount)}</p>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                      {invoice.status}
                                    </span>
                                    <button
                                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={isJobModalOpen}
        onClose={handleJobModalClose}
        job={selectedJob}
        onJobUpdate={handleJobUpdate}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Customer</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{customer.first_name} {customer.last_name}</strong>? 
              This action cannot be undone.
              {(jobs.length > 0 || estimates.length > 0 || invoices.length > 0) ? (
                <span className="block mt-2 text-red-600">
                  ⚠️ This customer has associated jobs, estimates, or invoices that must be deleted first.
                </span>
              ) : null}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDetails 