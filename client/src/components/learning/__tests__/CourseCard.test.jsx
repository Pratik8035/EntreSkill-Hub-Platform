// src/components/learning/__tests__/CourseCard.test.jsx
// Component tests for CourseCard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from '../CourseCard';

describe('CourseCard', () => {
  const mockCourse = {
    _id: '123',
    title: 'Test Course',
    description: 'Test course description',
    category: 'Entrepreneurship',
    difficultyLevel: 'Beginner',
    estimatedDuration: 60,
    thumbnail: 'https://example.com/image.jpg',
  };

  it('renders course information correctly', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test course description')).toBeInTheDocument();
    expect(screen.getByText('Entrepreneurship')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('renders without thumbnail', () => {
    const courseWithoutThumbnail = { ...mockCourse, thumbnail: null };

    render(
      <BrowserRouter>
        <CourseCard course={courseWithoutThumbnail} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('renders view course link', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    );

    const link = screen.getByText('View Course');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/courses/123');
  });

  it('renders null when course is not provided', () => {
    const { container } = render(
      <BrowserRouter>
        <CourseCard course={null} />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('applies correct difficulty level styling', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    );

    const difficultyBadge = screen.getByText('Beginner');
    expect(difficultyBadge).toHaveClass('bg-green-100', 'text-green-700');
  });
});
