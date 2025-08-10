import React from 'react';
import { FileText, CheckCircle, MessageSquare } from 'lucide-react';

const IntakeAnswersDisplay = ({ intakeAnswers = [] }) => {
  if (!intakeAnswers || intakeAnswers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
          Customer Questions & Answers
        </h3>
        <div className="py-4">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-center">No intake questions were answered for this job</p>
        </div>
      </div>
    );
  }

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'dropdown':
        return '📋';
      case 'multiple_choice':
        return '☑️';
      case 'picture_choice':
        return '🖼️';
      case 'short_text':
        return '📝';
      case 'long_text':
        return '📄';
      case 'color_choice':
        return '🎨';
      case 'image_upload':
        return '📸';
      default:
        return '❓';
    }
  };

  const formatAnswer = (answer, questionType) => {
    if (!answer) return 'No answer provided';
    
    if (questionType === 'multiple_choice' && Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    return answer;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
        Customer Questions & Answers
      </h3>
      
      <div className="space-y-4">
        {intakeAnswers.map((qa, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-lg">{getQuestionTypeIcon(qa.question_type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {qa.question_text}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {qa.question_type.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <p className="text-sm text-gray-700">
                    {formatAnswer(qa.answer, qa.question_type)}
                  </p>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Answered on {new Date(qa.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          <span>{intakeAnswers.length} question{intakeAnswers.length !== 1 ? 's' : ''} answered</span>
        </div>
      </div>
    </div>
  );
};

export default IntakeAnswersDisplay;
