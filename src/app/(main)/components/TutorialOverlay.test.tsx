import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TutorialOverlay from './TutorialOverlay';
import { tutorialSteps } from '@/lib/tutorialSteps';
import { usePaymentModalStore } from '@/store/paymentModalStore';

// Mock the payment modal store
jest.mock('@/store/paymentModalStore', () => ({
  usePaymentModalStore: jest.fn(),
}));

describe('TutorialOverlay', () => {
  const mockOnTutorialComplete = jest.fn();
  const mockOpenPaymentModal = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnTutorialComplete.mockClear();
    mockOpenPaymentModal.mockClear();
    localStorage.clear(); // Clear local storage to ensure tutorial runs
    (usePaymentModalStore as jest.Mock).mockReturnValue({
      openModal: mockOpenPaymentModal,
    });
  });

  test('renders the first tutorial step on initial load if not completed', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toHaveTextContent(tutorialSteps[0].description);
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  test('does not render if tutorial is already completed', () => {
    localStorage.setItem('prompt2code_tutorial_completed', 'true');
    const { container } = render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('advances through tutorial steps by clicking Next', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Initial step
    expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Second step
    expect(screen.getByRole('heading', { name: tutorialSteps[1].title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    
    // Third step
    expect(screen.getByRole('heading', { name: tutorialSteps[2].title })).toBeInTheDocument();
  });
  
  test('shows GitHub familiarity prompt after all regular steps', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Advance through all regular steps (total steps - 1 'welcome' + 1 for GitHub prompt)
    tutorialSteps.forEach(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });

    // Should now see the GitHub prompt
    expect(screen.getByRole('paragraph')).toHaveTextContent(/Are you familiar with GitHub?/i);
    expect(screen.getByRole('button', { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /No/i })).toBeInTheDocument();
  });

  test('choosing "Yes" on GitHub prompt leads to GitHub information and then tutorial complete', async () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Advance to GitHub prompt
    tutorialSteps.forEach(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));

    // Should show GitHub info
    expect(screen.getByRole('heading', { name: /GitHub Information/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Should now show tutorial complete dialog
    expect(screen.getByRole('heading', { name: /Tutorial Complete!/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add funds/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add funds/i }));

    // Verify payment modal is opened and tutorial is marked complete
    expect(mockOpenPaymentModal).toHaveBeenCalledTimes(1);
    expect(mockOnTutorialComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('prompt2code_tutorial_completed')).toBe('true');
  });

  test('choosing "No" on GitHub prompt leads directly to tutorial complete', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Advance to GitHub prompt
    tutorialSteps.forEach(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /No/i }));

    // Should directly show tutorial complete dialog
    expect(screen.queryByText(/GitHub Information/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tutorial Complete!/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add funds/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add funds/i }));

    // Verify payment modal is opened and tutorial is marked complete
    expect(mockOpenPaymentModal).toHaveBeenCalledTimes(1);
    expect(mockOnTutorialComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('prompt2code_tutorial_completed')).toBe('true');
  });

  test('Add funds button in tutorial complete dialog triggers payment modal and completes tutorial', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Advance to the tutorial complete state (simulating 'No' for GitHub prompt)
    tutorialSteps.forEach(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /No/i })); // Choose 'No' to go directly to complete

    const addFundsButton = screen.getByRole('button', { name: /Add funds/i });
    fireEvent.click(addFundsButton);

    expect(mockOpenPaymentModal).toHaveBeenCalledTimes(1);
    expect(mockOnTutorialComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('prompt2code_tutorial_completed')).toBe('true');
  });

  test('tutorial is marked complete and onTutorialComplete is called when Add funds is clicked', () => {
    render(<TutorialOverlay onTutorialComplete={mockOnTutorialComplete} />);

    // Advance to the tutorial complete state
    tutorialSteps.forEach(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /No/i })); // Choose 'No' for GitHub

    const addFundsButton = screen.getByRole('button', { name: /Add funds/i });
    fireEvent.click(addFundsButton);

    expect(localStorage.getItem('prompt2code_tutorial_completed')).toBe('true');
    expect(mockOnTutorialComplete).toHaveBeenCalledTimes(1);
  });
});
