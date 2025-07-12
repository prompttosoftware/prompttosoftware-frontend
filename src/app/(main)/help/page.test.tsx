import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpPage from './page';

describe('HelpPage', () => {
  test('renders the navigation sidebar and content area', () => {
    render(<HelpPage />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About This Application/i })).toBeInTheDocument();
  });

  test('displays "About" content by default', () => {
    render(<HelpPage />);
    expect(screen.getByRole('heading', { name: /About This Application/i })).toBeInTheDocument();
  });

  test('changes content when a navigation item is clicked', () => {
    render(<HelpPage />);

    // Click on GitHub
    const githubButton = screen.getByRole('button', { name: /GitHub/i });
    fireEvent.click(githubButton);
    expect(screen.getByRole('heading', { name: /Understanding GitHub & Its Use in Our Application/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /About This Application/i })).not.toBeInTheDocument();

    // Click on Jira
    const jiraButton = screen.getByRole('button', { name: /Jira/i });
    fireEvent.click(jiraButton);
    expect(screen.getByRole('heading', { name: /Understanding Jira & Its Use in Our Application/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Understanding GitHub & Its Use in Our Application/i })).not.toBeInTheDocument();


    // Click on Addons
    const addonsButton = screen.getByRole('button', { name: /Addons/i });
    fireEvent.click(addonsButton);
    expect(screen.getByRole('heading', { name: /Project Addons and Cost/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Understanding Jira & Its Use in Our Application/i })).not.toBeInTheDocument();

    // Click on Billing
    const billingButton = screen.getByRole('button', { name: /Billing/i });
    fireEvent.click(billingButton);
    expect(screen.getByRole('heading', { name: /Understanding Project Billing/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Project Addons and Cost/i })).not.toBeInTheDocument();
  });

  test('navigation buttons have correct accessible names', () => {
    render(<HelpPage />);
    expect(screen.getByRole('button', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Jira/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Addons/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Billing/i })).toBeInTheDocument();
  });
});
