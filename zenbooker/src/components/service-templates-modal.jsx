const templates = [
  { id: "junk-removal", name: "Junk Removal", icon: "🔧" },
  { id: "standard-detail", name: "Standard Detail", icon: "🔧" },
  { id: "tv-mounting", name: "TV Mounting", icon: "🔧" },
  { id: "smart-home", name: "Smart Home Install", icon: "🔧" },
  { id: "garage-door", name: "Garage Door Repair", icon: "🔧" },
  { id: "hvac", name: "Heating & Air Conditioning Inspection", icon: "🔧" },
  { id: "plumbing", name: "Plumbing Service Call", icon: "🔧" },
  { id: "water-heater", name: "Water Heater", icon: "🔧" },
  { id: "refrigerator", name: "Refrigerator", icon: "🔧" },
  { id: "range", name: "Range", icon: "🔧" },
  { id: "washing-machine", name: "Washing Machine", icon: "🔧" },
  { id: "dryer", name: "Dryer", icon: "🔧" },
  { id: "home-cleaning", name: "Standard Home Cleaning", icon: "🔧" },
]

const ServiceTemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Service Templates</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors w-full text-left border border-gray-200 hover:border-blue-500 group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <span className="text-xl">{template.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceTemplatesModal 