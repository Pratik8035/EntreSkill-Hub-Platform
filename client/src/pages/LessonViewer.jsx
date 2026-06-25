// src/pages/LessonViewer.jsx
// Lesson viewer page with content, video, and mark complete functionality

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getLessonById(id);
        setLesson(data);
        setIsCompleted(data.isCompleted || false);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          setError('Lesson not found');
        } else if (status === 401) {
          setError('Please sign in to view this lesson');
        } else {
          setError('Failed to load lesson');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await courseService.markLessonComplete(id);
      setIsCompleted(true);
    } catch (err) {
      setError('Failed to mark lesson as complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/learning" className="text-blue-600 hover:text-blue-700">
            Back to Learning Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <Link to="/learning" className="text-blue-600 hover:text-blue-700">
            Back to Learning Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { lesson: lessonData, quiz } = lesson;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/courses/${lessonData.courseId}`}
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{lessonData.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lessonData.duration} min
            </span>
            <span className={`px-2 py-1 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {lessonData.videoUrl && (
              <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
                <video
                  controls
                  className="w-full h-full"
                  poster={lessonData.thumbnail || undefined}
                >
                  <source src={lessonData.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Lesson Content */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Lesson Content</h2>
              <div className="prose max-w-none text-gray-700">
                {lessonData.content ? (
                  <p>{lessonData.content}</p>
                ) : (
                  <p className="text-gray-500">No content available for this lesson.</p>
                )}
              </div>
            </div>

            {/* Mark Complete Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleMarkComplete}
                disabled={isCompleted || markingComplete}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {markingComplete ? (
                  'Marking...'
                ) : isCompleted ? (
                  '✓ Lesson Completed'
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quiz Section */}
            {quiz && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Quiz</h3>
                  <span className="text-sm text-gray-500">{quiz.questions.length} questions</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Test your knowledge with this quiz. You need at least 70% to pass.
                </p>
                <button
                  onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-800">{lessonData.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order</span>
                  <span className="text-gray-800">{lessonData.order}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
