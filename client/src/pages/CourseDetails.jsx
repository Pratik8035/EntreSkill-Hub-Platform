// src/pages/CourseDetails.jsx
// Course details page with modules, lessons, and progress

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import courseService from '../services/courseService';
import useCourseProgress from '../hooks/useCourseProgress';
import ProgressCard from '../components/learning/ProgressCard';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { progress } = useCourseProgress(id);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseData, modulesData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseModules(id),
        ]);
        setCourse(courseData);
        setModules(modulesData);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          setError('Course not found');
        } else {
          setError('Failed to load course details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/learning" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Learning Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-1">{course.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.estimatedDuration} min
            </span>
            <span className={`px-2 py-1 rounded ${
              course.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
              course.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {course.difficultyLevel}
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
              {course.category}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Content</h2>
            
            {modules.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Content Available</h3>
                <p className="text-gray-500">This course doesn't have any modules yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div key={module._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h3 className="font-semibold text-gray-800">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                      )}
                    </div>
                    <div className="divide-y">
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map((lesson) => (
                          <Link
                            key={lesson._id}
                            to={`/lessons/${lesson._id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-medium">
                                {lesson.order}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{lesson.title}</p>
                                <p className="text-sm text-gray-500">{lesson.duration} min</p>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-sm text-gray-500">
                          No lessons in this module
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {progress && <ProgressCard progress={progress} />}
            
            {!progress && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Start Learning</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Begin this course to track your progress and earn certificates.
                </p>
                {modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0 && (
                  <Link
                    to={`/lessons/${modules[0].lessons[0]._id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start First Lesson
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
