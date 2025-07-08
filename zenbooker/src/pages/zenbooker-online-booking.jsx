"use client"

import { useState } from "react"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import {
  Copy,
  ExternalLink,
  Palette,
  FileText,
  Settings,
  Code,
  ChevronRight,
  MapPin,
  ChevronDown,
  HelpCircle,
} from "lucide-react"

const ZenbookerOnlineBooking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: "#4CAF50",
    headerBackground: "#ffffff",
    headerIcons: "#4CAF50",
    hideZenbookerBranding: false,
  })
  const [contentSettings, setContentSettings] = useState({
    heading: "Book Online",
    text: "Let's get started by entering your postal code.",
  })
  const [generalSettings, setGeneralSettings] = useState({
    serviceArea: "postal-code",
    serviceLayout: "default",
    datePickerStyle: "available-days",
    language: "english",
    textSize: "big",
    showPrices: false,
    includeTax: false,
    autoAdvance: true,
    allowCoupons: true,
    showAllOptions: false,
    showEstimatedDuration: false,
    limitAnimations: false,
    use24Hour: false,
    allowMultipleServices: false,
  })

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const configSections = [
    {
      id: "appearance",
      icon: Palette,
      title: "Appearance and branding",
      description: "Add your brand elements and colors to your customer facing booking page.",
      content: (
        <div className="space-y-6">
          {/* Color Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>Primary Brand Color</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <input
                  type="text"
                  value={brandingSettings.primaryColor}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>Header Background</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
                <div className="w-5 h-5 bg-white border border-gray-300 rounded-full"></div>
                <input
                  type="text"
                  value={brandingSettings.headerBackground}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, headerBackground: e.target.value })}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>Header Icons</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <input
                  type="text"
                  value={brandingSettings.headerIcons}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, headerIcons: e.target.value })}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            Customize All Colors
          </button>

          {/* Logo Upload */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Logo</h4>
            <p className="text-sm text-gray-600 mb-3">The logo you'd like displayed on your booking page</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm">Click to upload your logo</button>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Favicon</h4>
            <p className="text-sm text-gray-600 mb-3">Icon displayed in the address bar of your browser</p>
            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded"></div>
          </div>

          {/* Start Page Hero */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-medium text-gray-900">Start Page Hero</h4>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Express your brand with a photo or illustration displayed at the start of the booking form
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm">Upload your custom image</button>
            </div>
          </div>

          {/* Hide Zenbooker Branding */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Hide Zenbooker branding</h4>
              <p className="text-sm text-gray-600">Remove the "Powered by Zenbooker" link on your booking page</p>
            </div>
            <button
              onClick={() =>
                setBrandingSettings({
                  ...brandingSettings,
                  hideZenbookerBranding: !brandingSettings.hideZenbookerBranding,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                brandingSettings.hideZenbookerBranding ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  brandingSettings.hideZenbookerBranding ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "content",
      icon: FileText,
      title: "Content and messages",
      description: "Customize all user-facing text on the booking page. Edit the copy to match your brand.",
      content: (
        <div className="space-y-6">
          {/* Start Page Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">🎯</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Start Page</h4>
                  <p className="text-xs text-gray-600">Welcome section / service area check</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4 pl-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                <input
                  type="text"
                  value={contentSettings.heading}
                  onChange={(e) => setContentSettings({ ...contentSettings, heading: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <textarea
                  value={contentSettings.text}
                  onChange={(e) => setContentSettings({ ...contentSettings, text: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Other Content Sections */}
          {[
            { icon: "🛍️", title: "Service selection", desc: "Only appears if you have two or more bookable services" },
            { icon: "📅", title: "Scheduling Page", desc: "Appears for services that can be booked online" },
            { icon: "📋", title: "Scheduling Request Page", desc: "Appears for services that can be requested online" },
            { icon: "🏠", title: "Service Address Page", desc: "" },
            { icon: "📞", title: "Contact Info", desc: "Appears for services that don't require a payment method" },
            { icon: "💳", title: "Payment & Contact Info", desc: "Appears for services that require a payment method" },
            { icon: "✅", title: "Confirmation Message", desc: "" },
          ].map((section, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">{section.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
                  {section.desc && <p className="text-xs text-gray-600">{section.desc}</p>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "general",
      icon: Settings,
      title: "General",
      description:
        "Customize what customers can see and do on your booking page, and configure optional booking features.",
      content: (
        <div className="space-y-6">
          {/* Service Area */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Service area</h4>
            <p className="text-sm text-gray-600 mb-4">
              How should we check if customers are located within your service area?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  id: "postal-code",
                  title: "Postal code",
                  desc: "Ask customers for their postal code at the start of the booking process.",
                },
                {
                  id: "street-address",
                  title: "Street address",
                  desc: "Have customers enter their address using our autocomplete form.",
                },
                {
                  id: "territory",
                  title: "Territory dropdown",
                  desc: "Have customers select a service territory that you've created.",
                },
              ].map((option) => (
                <div key={option.id} className="text-center">
                  <div className="w-16 h-12 bg-gray-100 rounded mb-2 mx-auto flex items-center justify-center">
                    <div className="w-8 h-6 bg-blue-500 rounded"></div>
                  </div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">{option.title}</h5>
                  <p className="text-xs text-gray-600">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service Selection Layout */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Service selection layout</h4>
            <p className="text-sm text-gray-600 mb-4">How should bookable services be displayed?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  id: "default",
                  title: "Default",
                  desc: "Displays services with large cards that include the service description.",
                },
                {
                  id: "compact",
                  title: "Compact",
                  desc: "Displays services with small cards without the service description.",
                },
                {
                  id: "list",
                  title: "List",
                  desc: "Displays only the service name and price in a simple list format.",
                },
              ].map((layout) => (
                <div key={layout.id} className="text-center">
                  <div className="w-16 h-12 bg-gray-100 rounded mb-2 mx-auto"></div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">{layout.title}</h5>
                  <p className="text-xs text-gray-600">{layout.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Picker Style */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Date picker style</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="w-24 h-16 bg-gray-100 rounded mb-2 mx-auto"></div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Available Days</h5>
                <p className="text-xs text-gray-600">Shows the next dates with available times</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-16 bg-gray-100 rounded mb-2 mx-auto"></div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Month</h5>
                <p className="text-xs text-gray-600">Shows all available days in a month calendar</p>
              </div>
            </div>
          </div>

          {/* Language and Text Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <p className="text-xs text-gray-600 mb-2">Change the language your booking form is displayed in</p>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text size</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>Big</option>
                <option>Medium</option>
                <option>Small</option>
              </select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            {[
              { key: "showPrices", label: "Show prices of service options", desc: "" },
              { key: "includeTax", label: "Include tax when showing prices of service options", desc: "" },
              {
                key: "autoAdvance",
                label: "Auto advance form sections",
                desc: "Automatically advances to the next step of the booking form after the customer makes a selection.",
              },
              { key: "allowCoupons", label: "Allow customers to apply coupons", desc: "" },
              {
                key: "showAllOptions",
                label: "Show all options and questions on a single page",
                desc: "Displays all service modifier groups and intake questions at once instead of the multi-step flow.",
              },
              { key: "showEstimatedDuration", label: "Show estimated duration", desc: "" },
              {
                key: "limitAnimations",
                label: "Limit animations",
                desc: 'When enabled, functions options won\'t "pop" into view on the booking form.',
              },
              { key: "use24Hour", label: "Use 24-hour time when displaying slots", desc: "" },
              {
                key: "allowMultipleServices",
                label: "Allow booking multiple services at once",
                desc: "Note: recurring bookings can't be booked online when enabled.",
              },
            ].map((option) => (
              <div key={option.key} className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{option.label}</h5>
                  {option.desc && <p className="text-xs text-gray-600 mt-1">{option.desc}</p>}
                </div>
                <button
                  onClick={() => setGeneralSettings({ ...generalSettings, [option.key]: !generalSettings[option.key] })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                    generalSettings[option.key] ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      generalSettings[option.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Analytics */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics Tracking ID</label>
              <input
                type="text"
                placeholder="Enter your Google Tag ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook (Meta) Pixel ID</label>
              <input
                type="text"
                placeholder="Facebook Pixel ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "embed",
      icon: Code,
      title: "Embed your booking widget",
      description: "Add your booking form to your website. Choose from four different embed widgets.",
      content: (
        <div className="text-center py-8">
          <p className="text-gray-600">Widget embedding options will be displayed here.</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Configure Embed Options</button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="online-booking" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Online Booking</h1>
            <p className="text-gray-600 mt-1">
              Customize, embed, and share the booking page where customers can book your services.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Select a view</option>
              <option>Desktop</option>
              <option>Mobile</option>
              <option>Tablet</option>
            </select>
          </div>
        </div>

        {/* Mobile Header Content */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Online Booking</h1>
          <p className="text-gray-600 text-sm">
            Customize, embed, and share the booking page where customers can book your services.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Panel */}
            <div className="lg:w-1/2 p-6 bg-white border-r border-gray-200">
              {/* Booking Page URL */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  YOUR BOOKING PAGE URL
                </h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
                    widget.zenbooker.com/book/justwebagency
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" />
                    <span>View page</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  You can share this link with customers to let them book your services.
                </p>
              </div>

              {/* Configuration Sections */}
              <div className="space-y-4">
                {configSections.map((section, index) => {
                  const Icon = section.icon
                  const isExpanded = expandedSection === section.id
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        onClick={() => toggleSection(section.id)}
                        className="flex items-start space-x-4 p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{section.title}</h4>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {isExpanded && <div className="border-t border-gray-200 p-4 bg-gray-50">{section.content}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:w-1/2 p-6 bg-gray-100 flex items-center justify-center">
              <div className="max-w-sm w-full">
                {/* Browser Mockup */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Browser Header */}
                  <div className="bg-gray-200 px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>widget.zenbooker.com</span>
                    </div>
                  </div>

                  {/* Booking Widget Content */}
                  <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Online</h2>
                    <p className="text-gray-600 mb-6">Let's get started by entering your postal code.</p>

                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      </div>
                      <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                      <span>Powered by</span>
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Z</span>
                      </div>
                      <span>zenbooker</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenbookerOnlineBooking
