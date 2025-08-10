import React, { useState } from 'react';

const IntakeQuestionsForm = ({ questions = [], onAnswersChange }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);
  };

  const handleMultipleChoiceChange = (questionId, option, isChecked) => {
    const currentAnswers = answers[questionId] || [];
    let newAnswers;
    
    if (isChecked) {
      newAnswers = [...currentAnswers, option];
    } else {
      newAnswers = currentAnswers.filter(item => item !== option);
    }
    
    handleAnswerChange(questionId, newAnswers);
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  const renderQuestion = (question) => {
    const questionId = question.id;
    const currentAnswer = answers[questionId];

    switch (question.questionType) {
      case 'dropdown':
        return (
          <div key={questionId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500 mb-2">{question.description}</p>
            )}
            <select
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              required={question.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option.text}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={questionId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500 mb-2">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type={question.selectionType === 'multi' ? 'checkbox' : 'radio'}
                    name={questionId}
                    value={option.text}
                    checked={
                      question.selectionType === 'multi'
                        ? (currentAnswer || []).includes(option.text)
                        : currentAnswer === option.text
                    }
                    onChange={(e) => {
                      if (question.selectionType === 'multi') {
                        handleMultipleChoiceChange(questionId, option.text, e.target.checked);
                      } else {
                        handleAnswerChange(questionId, e.target.value);
                      }
                    }}
                    required={question.required}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'short_text':
        return (
          <div key={questionId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500 mb-2">{question.description}</p>
            )}
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              required={question.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your answer"
            />
          </div>
        );

      case 'long_text':
        return (
          <div key={questionId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500 mb-2">{question.description}</p>
            )}
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              required={question.required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your answer"
            />
          </div>
        );

      default:
        return (
          <div key={questionId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500 mb-2">{question.description}</p>
            )}
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              required={question.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your answer"
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Additional Questions
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Please answer the following questions to help us provide better service.
      </p>
      
      <div className="space-y-6">
        {questions.map(renderQuestion)}
      </div>
    </div>
  );
};

export default IntakeQuestionsForm;
