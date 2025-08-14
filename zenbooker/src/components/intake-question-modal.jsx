"use client"
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, HelpCircle, FileText, Minus } from 'lucide-react';

const IntakeQuestionModal = ({ isOpen, onClose, selectedQuestionType, onSave, editingQuestion }) => {
  console.log('🔄 IntakeQuestionModal props:', { isOpen, selectedQuestionType, editingQuestion });
  const [formData, setFormData] = useState({
    questionType: selectedQuestionType || 'multiple_choice',
    question: '',
    description: '',
    selectionType: 'single', // 'single' or 'multi'
    required: false,
    options: [
      {
        id: 1,
        text: ''
      }
    ]
  });

  const [showQuestionTypeDropdown, setShowQuestionTypeDropdown] = useState(false);

  const questionTypes = [
    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
    { value: 'picture_choice', label: 'Picture Choice', icon: '🖼️' },
    { value: 'short_text', label: 'Short Text Answer', icon: '📝' },
    { value: 'long_text', label: 'Long Text Answer', icon: '📄' },
    { value: 'color_choice', label: 'Color Choice', icon: '🎨' },
    { value: 'image_upload', label: 'Image Upload', icon: '📸' }
  ];

  const needsOptions = ['dropdown', 'multiple_choice', 'picture_choice', 'color_choice'].includes(formData.questionType);

  // Initialize form data when editing
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        id: editingQuestion.id,
        questionType: editingQuestion.questionType || 'multiple_choice',
        question: editingQuestion.question || '',
        description: editingQuestion.description || '',
        selectionType: editingQuestion.selectionType || 'single',
        required: editingQuestion.required || false,
        options: editingQuestion.options && editingQuestion.options.length > 0 
          ? editingQuestion.options.map((option, index) => ({
              id: option.id || index + 1,
              text: option.text || ''
            }))
          : [{ id: 1, text: '' }]
      });
    } else if (selectedQuestionType) {
      setFormData(prev => ({
        ...prev,
        questionType: selectedQuestionType
      }));
    }
  }, [editingQuestion, selectedQuestionType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (optionId, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId ? { ...option, text } : option
      )
    }));
  };

  const addOption = () => {
    const newOptionId = Math.max(...formData.options.map(o => o.id)) + 1;
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: newOptionId,
          text: ''
        }
      ]
    }));
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

  const getQuestionTypeIcon = (type) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType ? questionType.icon : '📋';
  };

  const getQuestionTypeLabel = (type) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType ? questionType.label : 'Dropdown';
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
          <h2 className="text-xl font-semibold text-gray-900">
            {editingQuestion ? 'Edit Intake Question' : 'Create Intake Question'}
          </h2>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuestionTypeDropdown(!showQuestionTypeDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getQuestionTypeIcon(formData.questionType)}</span>
                  <span className="text-sm text-gray-900">{getQuestionTypeLabel(formData.questionType)}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showQuestionTypeDropdown && (
                <>
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowQuestionTypeDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {questionTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          handleInputChange('questionType', type.value);
                          setShowQuestionTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm text-gray-900">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="ex. Describe the issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add an optional description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selection Type - Only show for question types that need options */}
          {needsOptions && (
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
                  { value: 'multi', label: 'Multi-Select' }
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
          )}

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

          {/* Options Section - Only show for question types that need options */}
          {needsOptions && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">OPTIONS</h3>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                      Option {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder="Enter an option..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              <button
                type="button"
                onClick={addOption}
                className="mt-4 flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add option</span>
              </button>
            </div>
          )}
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
            {editingQuestion ? 'Update Intake Question' : 'Create Intake Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntakeQuestionModal;