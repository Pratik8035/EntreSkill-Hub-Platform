// src/components/learning/__tests__/ProgressCard.test.jsx
// Component tests for ProgressCard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressCard from '../ProgressCard';

describe('ProgressCard', () => {
  const mockProgress = {
    completedLessons: 5,
    totalLessons: 10,
    progressPercentage: 50,
    completedModules: 2,
    remainingLessons: 5,
  };

  it('renders progress information correctly', () => {
    render(<ProgressCard progress={mockProgress} />);

    expect(screen.getByText('Course Progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Completed Lessons
    expect(screen.getByText('10')).toBeInTheDocument(); // Total Lessons
  });

  it('renders all stats correctly', () => {
    render(<ProgressCard progress={mockProgress} />);

    expect(screen.getByText('Completed Lessons')).toBeInTheDocument();
    expect(screen.getByText('Total Lessons')).toBeInTheDocument();
    expect(screen.getByText('Completed Modules')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders null when progress is not provided', () => {
    const { container } = render(<ProgressCard progress={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders progress bar with correct width', () => {
    render(<ProgressCard progress={mockProgress} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('handles 100% progress', () => {
    const fullProgress = { ...mockProgress, progressPercentage: 100 };
    render(<ProgressCard progress={fullProgress} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles 0% progress', () => {
    const emptyProgress = { ...mockProgress, progressPercentage: 0 };
    render(<ProgressCard progress={emptyProgress} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
