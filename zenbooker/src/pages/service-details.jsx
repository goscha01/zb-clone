"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import CreateRecurringOptionModal from "../components/create-recurring-option-modal"
import TerritoryAdjustmentModal from "../components/territory-adjustment-modal"
import ModifierModal from "../components/modifier-modal"
import IntakeQuestionModal from "../components/intake-question-modal"
import { 
  ChevronLeft,
  ChevronRight,
  Settings,
  Sliders,
  ListChecks,
  Clock,
  ClipboardList,
  RefreshCw,
  ArrowUpDown,
  CreditCard,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  Camera,
  Info,
  HelpCircle,
  MapPin
} from "lucide-react"

const ServiceDetails = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [editingModifier, setEditingModifier] = useState(null)
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false)
  const [isIntakeDropdownOpen, setIsIntakeDropdownOpen] = useState(false)
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false)
  const [selectedQuestionType, setSelectedQuestionType] = useState(null)
  const [isSkillTagModalOpen, setIsSkillTagModalOpen] = useState(false)
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false)
  const [recurringOptions, setRecurringOptions] = useState([])
  const [territoryRules, setTerritoryRules] = useState([])
  const [serviceData, setServiceData] = useState({
    name: "TV Mounting",
    description: "",
    baseDuration: { hours: 0, minutes: 30 },
    basePrice: "29",
    isFree: false,
    bookingType: "bookable",
    displayPrefix: "Estimated Total",
    isTaxable: false,
    hidePrice: false,
    modifiers: [
      {
        id: 1,
        title: "What size is your TV?",
        options: [
          { label: 'Up to 31"', price: "+$74 - 20 min" },
          { label: '32" - 60"', price: "+$50 - 30 min" },
          { label: '61" - 80"', price: "+$64 - 45 min" },
          { label: 'Over 81"', price: "+$97 - 1 hr" }
        ]
      },
      {
        id: 2,
        title: "Do you need a wall mount for your TV?",
        options: [
          { label: "I have one already", price: "" },
          { label: "Fixed", price: "+$30" },
          { label: "Tilting", price: "+$40" },
          { label: "Full Motion", price: "+$50" }
        ]
      },
      {
        id: 3,
        title: "Wire Concealment",
        options: [
          { label: "No Wire Concealment", price: "" },
          { label: "External Wire Concealment", price: "+$39 - 20 min" },
          { label: "In-Wall Wire Concealment", price: "+$65 - 45 min" }
        ]
      },
      {
        id: 4,
        title: "Device Setup",
        options: [
          { label: "Soundbar", price: "+$15 - 10 min" },
          { label: "Streaming Device", price: "+$15 - 15 min" },
          { label: "Gaming Console", price: "+$15 - 15 min" },
          { label: "Cable or Satellite Box", price: "+$15" }
        ]
      }
    ]
  })

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const handleEditModifier = (modifier) => {
    setEditingModifier(modifier)
    setIsModifierModalOpen(true)
  }

  const handleDeleteModifier = (modifierId) => {
    if (window.confirm("Are you sure you want to delete this modifier?")) {
      setServiceData(prev => ({
        ...prev,
        modifiers: prev.modifiers.filter(mod => mod.id !== modifierId)
      }))
    }
  }

  const handleSaveModifier = (modifierData) => {
    if (editingModifier) {
      // Update existing modifier
      setServiceData(prev => ({
        ...prev,
        modifiers: prev.modifiers.map(mod => 
          mod.id === editingModifier.id ? { ...modifierData, id: mod.id } : mod
        )
      }))
    } else {
      // Add new modifier
      setServiceData(prev => ({
        ...prev,
        modifiers: [...prev.modifiers, { ...modifierData, id: Date.now() }]
      }))
    }
    setIsModifierModalOpen(false)
    setEditingModifier(null)
  }

  const handleSaveIntakeQuestion = (questionData) => {
    // Handle saving the intake question
    console.log("Saving intake question:", questionData)
    setIsIntakeModalOpen(false)
    setSelectedQuestionType(null)
  }

  const IntakeQuestionDropdown = () => {
    const questionTypes = [
      { icon: "⬇️", label: "Dropdown", value: "dropdown" },
      { icon: "☑️", label: "Multiple Choice", value: "multiple_choice" },
      { icon: "🖼️", label: "Picture Choice", value: "picture_choice" },
      { icon: "📝", label: "Short Text Answer", value: "short_text" },
      { icon: "📄", label: "Long Text Answer", value: "long_text" },
      { icon: "🎨", label: "Color Choice", value: "color_choice" },
      { icon: "📸", label: "Image Upload", value: "image_upload" }
    ]

    const handleQuestionTypeSelect = (type) => {
      setSelectedQuestionType(type)
      setIsIntakeModalOpen(true)
      setIsIntakeDropdownOpen(false)
    }

    return (
      <div className="relative">
        <button
          onClick={() => setIsIntakeDropdownOpen(!isIntakeDropdownOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Intake Question
        </button>
        
        {isIntakeDropdownOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsIntakeDropdownOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleQuestionTypeSelect(type.value)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const SkillTagModal = () => {
    const [skillTagName, setSkillTagName] = useState("")

    const handleClose = () => {
      setIsSkillTagModalOpen(false)
      setSkillTagName("")
    }

    const handleSave = () => {
      // Handle saving the skill tag
      console.log("Saving skill tag:", skillTagName)
      handleClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create a skill tag</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill tag name
                </label>
                <input
                  type="text"
                  value={skillTagName}
                  onChange={(e) => setSkillTagName(e.target.value)}
                  placeholder="Ex: Cleaner, HVAC Tech"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-8">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Save Skill Tag
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionContent = (section) => {
    switch (section.id) {
      case "intake":
        return (
          <div className="p-4 space-y-6">
            <div className="flex items-start space-x-2">
              <p className="text-sm text-gray-600 flex-1">
                Intake questions allow you to collect extra information from your customers during the booking process using custom fields.
              </p>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center whitespace-nowrap">
                <Info className="w-4 h-4 mr-1" />
                Learn more about intake questions
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <IntakeQuestionDropdown />
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <img src="/images/intake-questions.svg" alt="Example question" className="w-full h-auto mb-2" />
                  <p className="text-sm text-gray-500">Add custom fields to collect information</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <img src="/images/feedback-and-reviews-6.svg" alt="Example review" className="w-full h-auto mb-2" />
                  <p className="text-sm text-gray-500">Collect feedback after service completion</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "availability":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              You can override your default business hours and availability settings, and offer custom timeslots for this service using a timeslot template.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="default-time-slots"
                  name="time-slots"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="default-time-slots" className="text-sm text-gray-900">
                  Use default time slots based on your business hours and availability settings
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="custom-time-slots"
                  name="time-slots"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="custom-time-slots" className="text-sm text-gray-900">
                  Use a custom timeslot template
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum booking notice</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="custom-booking-notice"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="custom-booking-notice" className="text-sm text-gray-900">
                    Set custom minimum booking notice for this service
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case "team":
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Required skills</h3>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Learn more
                  </a>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Add required skill tags to make sure jobs booked for this service are assigned to the right team members.
                </p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500 mb-2">No skill tags available</p>
                  <button 
                    onClick={() => setIsSkillTagModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Create new skill tag
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  No skills tags required. Any service provider can be assigned to jobs for this service.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum crew size</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the number of service providers needed to complete this type of service
                </p>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-300 rounded-md text-sm p-2">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                  <span className="text-sm text-gray-600">service provider</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Assignment & job offers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Control how providers are assigned when this service is booked
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="manual-assign"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                      defaultChecked
                    />
                    <div>
                      <label htmlFor="manual-assign" className="text-sm font-medium text-gray-900 block">
                        Manual
                      </label>
                      <p className="text-sm text-gray-500">
                        Jobs for this service will not be automatically assigned or offered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="auto-assign"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <label htmlFor="auto-assign" className="text-sm font-medium text-gray-900 block">
                        Automatically assign
                      </label>
                      <p className="text-sm text-gray-500">
                        Assigns the required number of available providers who possess the necessary skill tags to jobs for this service
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="auto-offer"
                      name="assignment"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <label htmlFor="auto-offer" className="text-sm font-medium text-gray-900 block">
                        Automatically offer
                      </label>
                      <p className="text-sm text-gray-500">
                        Offers jobs for this service to all available providers who possess the necessary skill tags until the required number of providers needed accept
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "recurring":
        return (
          <div className="p-4 space-y-6">
            {recurringOptions.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Recurring options</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Let customers schedule this service as a recurring booking by adding recurring frequencies that customers will be able to choose from. You can also offer discounts for certain frequencies.
                  </p>
                </div>
                <button 
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create a Recurring Option
                </button>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 block">
                  Learn more
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recurring Options</h3>
                  <button 
                    onClick={() => setIsRecurringModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {recurringOptions.map((option, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{option.name}</h4>
                          <p className="text-sm text-gray-600">
                            Every {option.interval} {option.frequency.toLowerCase()}{option.interval > 1 ? 's' : ''}
                            {option.discount !== 'None' && ` • ${option.discount} discount`}
                          </p>
                        </div>
                        <button className="text-red-600 text-sm hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "territory":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Territory adjustments allow you to dynamically increase or decrease this service's price for specific territories
            </p>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Service territory price rules</h3>
                {territoryRules.length > 0 && (
                  <button 
                    onClick={() => setIsTerritoryModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Rule
                  </button>
                )}
              </div>
              
              {territoryRules.length === 0 ? (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        No territory adjustment rules set up yet. Add rules to customize pricing for specific territories.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsTerritoryModalOpen(true)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add Rule
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {territoryRules.map((rule, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.territory}</h4>
                          <p className="text-sm text-gray-600">
                            {rule.operation === 'increase' ? 'Increase' : 'Decrease'} price by{' '}
                            {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
                          </p>
                        </div>
                        <button className="text-red-600 text-sm hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case "payments":
        return (
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Require payment method</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Require customers provide a valid payment method when booking this service online?
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">No</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        )

      case "howItWorks":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Highlight the features of this service or your business, answer common questions customers might have, and showcase reviews from other customers.
            </p>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Frequently asked questions</h3>
                <p className="text-sm text-gray-600 mb-4">Add questions and answers customers might have about this service.</p>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900">What's included in the TV mounting service?</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      Our service includes securely mounting your TV to the wall using your mount or one we offer. We can also select wall stud locations and ensure your TV is level and mounted at the right height. You can also add wire concealment and device setup during booking.
                    </p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add another question</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">How it works</h3>
                <p className="text-sm text-gray-600 mb-4">Walk customers through how this service works, including what happens next after booking.</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Select your options</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose your TV size, wall mount type, and any additional services like wire concealment or device setup.
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add another step</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Highlights</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Emphasize important features of this service or your business to customers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-sm text-gray-900">Fast Service</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Testimonials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Show reviews and testimonials from your satisfied past customers.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
              </div>
            </div>
          </div>
        )

      case "bookingPage":
        return (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Visibility</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you hide this service from your booking page, customers will only be able to book it if you link directly to it or embed it
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-3 text-sm text-gray-900">Show service on booking page</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Hide service on booking page</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Confirmation page</h3>
              <p className="text-sm text-gray-600 mb-4">
                Customize what should happen after a customer books this service from your booking page
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-3 text-sm text-gray-900">Display default confirmation message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Display custom confirmation message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="confirmation"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">Redirect to external site</span>
                </label>
              </div>
            </div>
          </div>
        )

      case "bookingLink":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Customers can book this service from your booking page. You can also link directly to this service or embed it inside a widget.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Direct link to book this service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You can copy and paste this link to share this service's booking form with your customers.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value="https://widget.zenbooker.com/book/justwebagency?preselected=1"
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50"
                  />
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Copy
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Embed this service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Embed the booking page for this service on your website. Choose from four different embed widgets.
                </p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Embed Service
                </button>
              </div>
            </div>
          </div>
        )

      case "details":
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                />
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Base Price and Duration</label>
                    <div className="flex gap-4 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Base duration <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={serviceData.baseDuration.hours}
                            onChange={(e) => setServiceData({
                              ...serviceData,
                              baseDuration: { ...serviceData.baseDuration, hours: parseInt(e.target.value) }
                            })}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                          />
                          <span className="text-sm text-gray-600 py-1">hours</span>
                          <input
                            type="number"
                            value={serviceData.baseDuration.minutes}
                            onChange={(e) => setServiceData({
                              ...serviceData,
                              baseDuration: { ...serviceData.baseDuration, minutes: parseInt(e.target.value) }
                            })}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                          />
                          <span className="text-sm text-gray-600 py-1">minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Base price <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                        <div className="flex gap-2">
                          <span className="text-sm text-gray-600 py-1">$</span>
                          <input
                            type="text"
                            value={serviceData.basePrice}
                            onChange={(e) => setServiceData({ ...serviceData, basePrice: e.target.value })}
                            className="w-20 border border-gray-300 rounded-md px-2 py-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Minimum price <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                        <input
                          type="text"
                          placeholder="Optional"
                          className="w-32 border border-gray-300 rounded-md px-2 py-1"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={serviceData.isFree}
                          onChange={(e) => setServiceData({ ...serviceData, isFree: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">This service is free</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Booking page behavior</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'bookable' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'bookable' })}>
                        <div className="flex justify-center mb-2">📅</div>
                        <h3 className="text-sm font-medium text-center mb-1">Bookable</h3>
                        <p className="text-xs text-gray-500 text-center">Customers can directly book available times for this service.</p>
                      </div>
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'request' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'request' })}>
                        <div className="flex justify-center mb-2">🗓️</div>
                        <h3 className="text-sm font-medium text-center mb-1">Booking Request</h3>
                        <p className="text-xs text-gray-500 text-center">Customers propose multiple times, and you confirm one.</p>
                      </div>
                      <div className={`border rounded-lg p-4 cursor-pointer ${serviceData.bookingType === 'quote' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setServiceData({ ...serviceData, bookingType: 'quote' })}>
                        <div className="flex justify-center mb-2">💰</div>
                        <h3 className="text-sm font-medium text-center mb-1">Quote Request</h3>
                        <p className="text-xs text-gray-500 text-center">Customers provide details, and you send them a custom price quote.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Price display options</label>
                    <p className="text-sm text-gray-500 mb-3">Control how pricing should be displayed to customers.</p>
                    
                    <div className="mb-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={serviceData.hidePrice}
                          onChange={(e) => setServiceData({ ...serviceData, hidePrice: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">Don't show price when booking online</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Display prefix <HelpCircle className="inline-block w-4 h-4 text-gray-400" /></label>
                      <input
                        type="text"
                        value={serviceData.displayPrefix}
                        onChange={(e) => setServiceData({ ...serviceData, displayPrefix: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1"
                      />
                      <p className="text-sm text-gray-500">$29</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Taxes</label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceData.isTaxable}
                        onChange={(e) => setServiceData({ ...serviceData, isTaxable: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-600">This service is taxable</span>
                    </label>
                  </div>
                </div>

                <div className="w-48">
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <button className="text-sm text-blue-600 font-medium">Add an image</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "modifiers":
        return (
          <div className="p-4 space-y-6">
            <p className="text-sm text-gray-600">Service modifiers are groups of options that can adjust this service's price and duration when selected.</p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Learn more about service modifiers
            </a>

            <div className="space-y-4">
              {serviceData.modifiers.map((modifier, index) => (
                <div key={modifier.id} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">⋮⋮</span>
                      <span className="font-medium">{modifier.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditModifier(modifier)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteModifier(modifier.id)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {modifier.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                          {option.label}
                          {option.price && <span className="text-gray-500 ml-1">{option.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setEditingModifier(null)
                setIsModifierModalOpen(true)
              }}
              className="w-full border border-gray-300 rounded-lg p-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              New Modifier Group
            </button>
          </div>
        )

      default:
        return null
    }
  }

  const handleSaveRecurringOption = (recurringOption) => {
    setRecurringOptions(prev => [...prev, recurringOption])
  }

  const handleSaveTerritoryRule = (rule) => {
    setTerritoryRules(prev => [...prev, rule])
  }

  const sections = [
    {
      id: "details",
      icon: Settings,
      title: "Service Details",
      description: "Name, description, duration, and price",
    },
    {
      id: "modifiers",
      icon: Sliders,
      title: "Service Modifiers",
      description: "Add selectable options that can adjust this service's price and duration",
      badge: "2 Modifier Groups"
    },
    {
      id: "intake",
      icon: ListChecks,
      title: "Intake Questions",
      description: "Add custom form fields to collect additional info"
    },
    {
      id: "availability",
      icon: Clock,
      title: "Availability",
      description: "Use your business's default hours, or show custom timeslots for this service"
    },
    {
      id: "team",
      icon: ClipboardList,
      title: "Team Requirements & Assignment Options",
      description: "Add required skills and customize how jobs should be assigned for this service"
    },
    {
      id: "recurring",
      icon: RefreshCw,
      title: "Recurring Options",
      description: "Give customers the option to book this service as a recurring appointment"
    },
    {
      id: "territory",
      icon: ArrowUpDown,
      title: "Territory Adjustments",
      description: "Customize pricing for this service based on which territory it's booked in"
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "Payments",
      description: "No payment method required"
    },
    {
      id: "howItWorks",
      icon: FileText,
      title: "How it Works, FAQ, Testimonials, & Highlights",
      description: "Showcase attributes about this service or your business when customers book online"
    },
    {
      id: "bookingPage",
      icon: Globe,
      title: "Booking Page",
      description: "Hidden on booking page • Default confirmation message"
    },
    {
      id: "bookingLink",
      icon: ExternalLink,
      title: "Booking Link & Widgets",
      description: "Embed this service in a booking widget or link directly to it"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="services" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <button
                onClick={() => navigate("/services")}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Services
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 mt-2">
                {serviceData.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <section.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
                        <div>
                          <h2 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                            <span>{section.title}</span>
                            {section.badge && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {section.badge}
                              </span>
                            )}
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                          expandedSection === section.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedSection === section.id && renderSectionContent(section)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ModifierModal
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false)
          setEditingModifier(null)
        }}
        editingModifier={editingModifier}
        onSave={handleSaveModifier}
      />
      <IntakeQuestionModal
        isOpen={isIntakeModalOpen}
        onClose={() => {
          setIsIntakeModalOpen(false)
          setSelectedQuestionType(null)
        }}
        selectedQuestionType={selectedQuestionType}
        onSave={handleSaveIntakeQuestion}
      />
      {isSkillTagModalOpen && <SkillTagModal />}
      <CreateRecurringOptionModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave={handleSaveRecurringOption}
      />
      <TerritoryAdjustmentModal
        isOpen={isTerritoryModalOpen}
        onClose={() => setIsTerritoryModalOpen(false)}
        onSave={handleSaveTerritoryRule}
      />
    </div>
  )
}

export default ServiceDetails 