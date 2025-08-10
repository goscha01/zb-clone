"use client"
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Plus, HelpCircle, Image as ImageIcon } from 'lucide-react';

const CreateModifierGroupModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    groupName: '',
    groupDescription: '',
    selectionType: 'single', // 'single', 'multi', 'quantity'
    required: false,
    options: [
      {
        id: 1,
        name: '',
        image: null,
        description: '',
        price: 0,
        durationHours: 0,
        durationMinutes: 0,
        allowCustomerNotes: false,
        convertToServiceRequest: false
      }
    ]
  });

  const [expandedOption, setExpandedOption] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId ? { ...option, [field]: value } : option
      )
    }));
  };

  const addNewOption = () => {
    const newOptionId = Math.max(...formData.options.map(o => o.id)) + 1;
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: newOptionId,
          name: '',
          image: null,
          description: '',
          price: 0,
          durationHours: 0,
          durationMinutes: 0,
          allowCustomerNotes: false,
          convertToServiceRequest: false
        }
      ]
    }));
    setExpandedOption(newOptionId);
  };

  const removeOption = (optionId) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter(option => option.id !== optionId)
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Create Modifier Group</h2>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Information */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Group name
                </label>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => handleInputChange('groupName', e.target.value)}
                placeholder="Group name (ex. Number of bedrooms to clean)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Group description
                </label>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <textarea
                rows={3}
                value={formData.groupDescription}
                onChange={(e) => handleInputChange('groupDescription', e.target.value)}
                placeholder="Add an optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Selection Type */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Selection type
              </label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              {[
                { value: 'single', label: 'Single Select' },
                { value: 'multi', label: 'Multi-Select' },
                { value: 'quantity', label: 'Quantity Select' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('selectionType', type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.selectionType === type.value
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Required
              </label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('required', !formData.required)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.required ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.required ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Options Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">OPTIONS</h3>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4">
              {formData.options.map((option) => (
                <div key={option.id} className="border border-gray-200 rounded-lg">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedOption(expandedOption === option.id ? null : option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {expandedOption === option.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => handleOptionChange(option.id, 'name', e.target.value)}
                          placeholder="Option 1 name"
                          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {formData.options.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(option.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedOption === option.id && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image
                        </label>
                        <button
                          type="button"
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Upload image</span>
                        </button>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={option.description}
                          onChange={(e) => handleOptionChange(option.id, 'description', e.target.value)}
                          placeholder="Add an optional description for this option..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Price and Duration */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) => handleOptionChange(option.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={option.durationHours}
                              onChange={(e) => handleOptionChange(option.id, 'durationHours', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="flex items-center text-sm text-gray-500">hr</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            &nbsp;
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={option.durationMinutes}
                              onChange={(e) => handleOptionChange(option.id, 'durationMinutes', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="flex items-center text-sm text-gray-500">min</span>
                          </div>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Allow customers to add a note
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOptionChange(option.id, 'allowCustomerNotes', !option.allowCustomerNotes)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              option.allowCustomerNotes ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                option.allowCustomerNotes ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Convert to service request
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              When selected, booking will require review before confirmation
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOptionChange(option.id, 'convertToServiceRequest', !option.convertToServiceRequest)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              option.convertToServiceRequest ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                option.convertToServiceRequest ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Option Button */}
            <button
              type="button"
              onClick={addNewOption}
              className="mt-4 flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Option</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Modifier Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModifierGroupModal;
