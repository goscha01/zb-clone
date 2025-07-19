"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"

const IntakeQuestionModal = ({ isOpen, onClose, selectedQuestionType, onSave }) => {
  const [formData, setFormData] = useState({
    questionType: "",
    question: "",
    description: "",
    placeholder: "",
    isRequired: false,
    options: [{ text: "", value: 1 }]
  })

  useEffect(() => {
    if (selectedQuestionType) {
      setFormData(prev => ({
        ...prev,
        questionType: selectedQuestionType
      }))
    }
  }, [selectedQuestionType])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      questionType: "",
      question: "",
      description: "",
      placeholder: "",
      isRequired: false,
      options: [{ text: "", value: 1 }]
    })
    onClose()
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: "", value: prev.options.length + 1 }]
    }))
  }

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, text } : option
      )
    }))
  }

  const getQuestionTypeLabel = (type) => {
    const types = {
      dropdown: "Dropdown",
      multiple_choice: "Multiple Choice",
      picture_choice: "Picture Choice",
      short_text: "Short Text Answer",
      long_text: "Long Text Answer",
      color_choice: "Color Choice",
      image_upload: "Image Upload"
    }
    return types[type] || type
  }

  const needsOptions = ["dropdown", "multiple_choice", "picture_choice", "color_choice"].includes(formData.questionType)

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl my-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Add {getQuestionTypeLabel(formData.questionType)} Question
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g., What type of cleaning do you need?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this question"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {(formData.questionType === "short_text" || formData.questionType === "long_text") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="e.g., Enter your address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {needsOptions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.options.length > 1 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                Required question
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex-1">
            <span className="text-sm text-gray-600">PREVIEW</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntakeQuestionModal