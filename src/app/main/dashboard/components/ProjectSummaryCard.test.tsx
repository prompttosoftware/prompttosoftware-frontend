import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectSummaryCard from './ProjectSummaryCard';

describe('ProjectSummaryCard', () => {
  const mockProject = {
    id: '123',
    name: 'Test Project',
    description: 'This is a test description.',
    status: 'active',
    repositoryUrl: 'https://github.com/test/test-project',
    costToDate: 150.75,
    totalRuntime: 7200, // 2 hours in seconds
    progress: 75,
  };

  it('renders project name and description', () => {
    render(<ProjectSummaryCard project={mockProject} />);
    expect(screen.getByRole('link', { name: /test project/i })).toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toHaveTextContent(/This is a test description\./i);
  });

  it('displays cost to date correctly formatted', () => {
    render(<ProjectSummaryCard project={mockProject} />);
    expect(screen.getByText((content, element) => {
      if (element?.tagName.toLowerCase() !== 'div') return false;
      const divContent = element.textContent || '';
      return divContent.replace(/\s+/g, ' ').trim() === 'Cost to Date: $150.75';
    })).toBeInTheDocument();
  });

  it('displays total runtime correctly formatted', () => {
    render(<ProjectSummaryCard project={mockProject} />);
    // Assuming 7200 seconds is formatted as 2h 0m 0s or similar
    // The component uses formatDuration from @/lib/formatters, which formats to "2h"
    expect(screen.getByText((content, element) => {
      if (element?.tagName.toLowerCase() !== 'div') return false;
      const divContent = element.textContent || '';
      return divContent.replace(/\s+/g, ' ').trim() === 'Total Runtime: 02:00:00';
    })).toBeInTheDocument();
  });

  it('displays progress bar with correct value', () => {
    render(<ProjectSummaryCard project={mockProject} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    // Verify the progress bar element exists, but not its aria-valuenow directly as it's not rendered on the main progressbar element
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  
});
