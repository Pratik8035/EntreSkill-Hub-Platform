// src/components/learning/CertificateCard.jsx
// Card component for displaying certificate information

import { useState } from 'react';

const CertificateCard = ({ certificate }) => {
  const [showVerification, setShowVerification] = useState(false);

  if (!certificate) return null;

  const { certificateNumber, courseName, issuedAt, completionPercentage, finalScore } = certificate;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const verificationUrl = `${window.location.origin}/certificates/verify/${certificateNumber}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-lg mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{courseName}</h3>
            <p className="text-sm text-gray-500">Certificate #{certificateNumber}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          Issued: {formatDate(issuedAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Completion</p>
          <p className="text-xl font-bold text-gray-800">{completionPercentage}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Final Score</p>
          <p className="text-xl font-bold text-gray-800">{finalScore}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowVerification(!showVerification)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showVerification ? 'Hide Verification Link' : 'Show Verification Link'}
        </button>

        {showVerification && (
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Verification URL:</p>
            <p className="text-sm text-gray-700 break-all">{verificationUrl}</p>
          </div>
        )}

        <button className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;
