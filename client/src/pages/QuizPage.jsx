// src/pages/QuizPage.jsx
// Quiz page with questions, answer submission, and results view

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useQuiz from '../hooks/useQuiz';
import courseService from '../services/courseService';
import QuizResultCard from '../components/learning/QuizResultCard';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quiz, loading: quizLoading, error: quizError } = useQuiz(id);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some((a) => a === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const quizResult = await courseService.submitQuiz(id, answers);
      setResult(quizResult);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setResult(null);
    setError(null);
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{quizError.message || 'Failed to load quiz'}</p>
          <Link to="/learning" className="text-blue-600 hover:text-blue-700">
            Back to Learning Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quiz not found</p>
          <Link to="/learning" className="text-blue-600 hover:text-blue-700">
            Back to Learning Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/learning" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Learning Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600 mt-1">{quiz.questions.length} questions • 70% to pass</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitted && result ? (
          <QuizResultCard result={result} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {quiz.questions.map((question, questionIndex) => (
                <div key={questionIndex}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {questionIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          answers[questionIndex] === optionIndex
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {answers.filter((a) => a !== null).length} / {quiz.questions.length} answered
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.some((a) => a === null)}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  submitting || answers.some((a) => a === null)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        )}

        {submitted && result && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleRetry}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Retry Quiz
            </button>
            {result.passed && (
              <button
                onClick={() => navigate('/certificates')}
                className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                View Certificate
              </button>
            )}
            <Link
              to="/learning"
              className="flex-1 text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
