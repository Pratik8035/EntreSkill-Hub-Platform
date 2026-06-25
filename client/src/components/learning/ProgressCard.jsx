// src/components/learning/ProgressCard.jsx
// Card component for displaying course progress

const ProgressCard = ({ progress }) => {
  if (!progress) return null;

  const { completedLessons, totalLessons, progressPercentage, completedModules, remainingLessons } = progress;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Completion</span>
          <span className="font-semibold">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Completed Lessons</p>
          <p className="text-2xl font-bold text-gray-800">{completedLessons}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Total Lessons</p>
          <p className="text-2xl font-bold text-gray-800">{totalLessons}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Completed Modules</p>
          <p className="text-2xl font-bold text-gray-800">{completedModules}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Remaining</p>
          <p className="text-2xl font-bold text-gray-800">{remainingLessons}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
