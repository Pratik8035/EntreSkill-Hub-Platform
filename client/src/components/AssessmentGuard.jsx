// src/components/AssessmentGuard.jsx
// Component‑level guard that checks if the logged‑in user has completed the assessment.
// If not, it redirects to "/assessment". Otherwise it renders its children.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assessmentService from '../services/assessmentService.js';

const AssessmentGuard = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await assessmentService.getAssessmentStatus();
        // data contains { isCompleted, ... }
        if (!data?.isCompleted) {
          navigate('/assessment');
        } else {
          // assessment complete – allow rendering
        }
      } catch (err) {
        // In case of error (e.g., token expired) the api interceptor will redirect to login.
        console.error('Assessment status check failed', err);
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [navigate]);

  // While checking we can render nothing (or a spinner). The router already guards auth.
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Loading assessment status...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AssessmentGuard;
