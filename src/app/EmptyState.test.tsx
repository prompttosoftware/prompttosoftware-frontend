import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EmptyState from './(main)/components/EmptyState';

describe('EmptyState', () => {
    it('renders the message correctly', () => {
        const testMessage = 'There are no items to display.';
        const { container } = render(<EmptyState message={testMessage} />);
        const paragraphElement = container.querySelector('p');
        expect(paragraphElement).toHaveTextContent(testMessage);
    });

    it('renders the icon correctly', () => {
        const testMessage = 'There are no items to display.';
        render(<EmptyState message={testMessage} />);
        const iconElement = screen.getByTestId('empty-state-icon');
        expect(iconElement).toBeInTheDocument();
    });

    it('renders the action button when provided', () => {
        const testMessage = 'There are no items to display.';
        const actionButton = <button>Click Me</button>;
        render(<EmptyState message={testMessage} actionButton={actionButton} />);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });
});
