// src/components/learning/__tests__/CertificateCard.test.jsx
// Component tests for CertificateCard

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CertificateCard from '../CertificateCard';

describe('CertificateCard', () => {
  const mockCertificate = {
    certificateNumber: 'ESH-2026-00001',
    courseName: 'Test Course',
    issuedAt: '2026-01-15T00:00:00.000Z',
    completionPercentage: 100,
    finalScore: 95,
  };

  it('renders certificate information correctly', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Certificate #ESH-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders null when certificate is not provided', () => {
    const { container } = render(<CertificateCard certificate={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('toggles verification link visibility', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    const toggleButton = screen.getByText('Show Verification Link');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('Hide Verification Link')).toBeInTheDocument();
    expect(screen.getByText(/Verification URL:/)).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('Show Verification Link')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    const downloadButton = screen.getByText('Download Certificate');
    expect(downloadButton).toBeInTheDocument();
  });

  it('formats issued date correctly', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    expect(screen.getByText(/Issued:/)).toBeInTheDocument();
  });

  it('displays completion and final score stats', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    expect(screen.getByText('Completion')).toBeInTheDocument();
    expect(screen.getByText('Final Score')).toBeInTheDocument();
  });

  it('renders verification URL when shown', () => {
    render(<CertificateCard certificate={mockCertificate} />);

    const toggleButton = screen.getByText('Show Verification Link');
    fireEvent.click(toggleButton);

    expect(screen.getByText(/Verification URL:/)).toBeInTheDocument();
  });
});
