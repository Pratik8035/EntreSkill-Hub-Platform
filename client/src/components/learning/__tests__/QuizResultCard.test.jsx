// src/components/learning/__tests__/QuizResultCard.test.jsx
// Component tests for QuizResultCard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuizResultCard from '../QuizResultCard';

describe('QuizResultCard', () => {
  const mockResult = {
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    passed: true,
    answers: [
      { questionIndex: 0, selectedAnswer: 0, isCorrect: true },
      { questionIndex: 1, selectedAnswer: 1, isCorrect: false },
      { questionIndex: 2, selectedAnswer: 0, isCorrect: true },
    ],
  };

  it('renders quiz results correctly', () => {
    render(<QuizResultCard result={mockResult} />);

    expect(screen.getByText('Quiz Results')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows passed badge when quiz is passed', () => {
    render(<QuizResultCard result={mockResult} />);

    const passedBadge = screen.getByText('Passed');
    expect(passedBadge).toBeInTheDocument();
    expect(passedBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('shows failed badge when quiz is failed', () => {
    const failedResult = { ...mockResult, passed: false, percentage: 60 };
    render(<QuizResultCard result={failedResult} />);

    const failedBadge = screen.getByText('Failed');
    expect(failedBadge).toBeInTheDocument();
    expect(failedBadge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('renders answer breakdown', () => {
    render(<QuizResultCard result={mockResult} />);

    expect(screen.getByText('Answer Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
  });

  it('shows correct/incorrect status for each answer', () => {
    render(<QuizResultCard result={mockResult} />);

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('shows retry message when quiz is failed', () => {
    const failedResult = { ...mockResult, passed: false, percentage: 60 };
    render(<QuizResultCard result={failedResult} />);

    expect(screen.getByText(/You need at least 70% to pass/)).toBeInTheDocument();
  });

  it('does not show retry message when quiz is passed', () => {
    render(<QuizResultCard result={mockResult} />);

    expect(screen.queryByText(/You need at least 70% to pass/)).not.toBeInTheDocument();
  });

  it('renders null when result is not provided', () => {
    const { container } = render(<QuizResultCard result={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('displays correct count of correct answers', () => {
    render(<QuizResultCard result={mockResult} />);

    const correctCount = screen.getByText('2'); // 2 out of 3 are correct
    expect(correctCount).toBeInTheDocument();
  });
});
