// src/components/learning/QuizResultCard.jsx
// Card component for displaying quiz results

const QuizResultCard = ({ result }) => {
  if (!result) return null;

  const { score, totalQuestions, percentage, passed, answers } = result;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Quiz Results</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {passed ? 'Passed' : 'Failed'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{score}/{totalQuestions}</p>
          <p className="text-sm text-gray-500">Score</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
          <p className="text-sm text-gray-500">Percentage</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">
            {answers.filter((a) => a.isCorrect).length}
          </p>
          <p className="text-sm text-gray-500">Correct</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Answer Breakdown</h4>
        {answers.map((answer, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded ${
              answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <span className="text-sm text-gray-600">Question {index + 1}</span>
            <span className={`text-sm font-semibold ${
              answer.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </div>
        ))}
      </div>

      {!passed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            You need at least 70% to pass. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizResultCard;
