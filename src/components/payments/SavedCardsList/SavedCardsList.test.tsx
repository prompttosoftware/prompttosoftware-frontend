import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedCardsList } from './SavedCardsList';
import { SavedCard } from '@/types/payments';


describe('SavedCardsList', () => {
  const mockCards: SavedCard[] = [
    {
      id: 'card_1',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
    },
    {
      id: 'card_2',
      brand: 'mastercard',
      last4: '5555',
      expMonth: 10,
      expYear: 2026,
    },
  ];

  it('renders the heading correctly', () => {
    render(<SavedCardsList cards={[]} />);
    expect(screen.getByRole('heading', { name: /Your Saved Payment Methods/i })).toBeInTheDocument();
  });

  it('renders no cards when an empty array is provided', () => {
    render(<SavedCardsList cards={[]} />);
    expect(screen.queryByText(/**** \d{4}/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Expires:/i)).not.toBeInTheDocument();
  });

  it('renders all provided saved cards', () => {
    render(<SavedCardsList cards={mockCards} />);

    expect(screen.getByText(/visa/i)).toBeInTheDocument();
    expect(screen.getByText(/**** **** **** 4242/)).toBeInTheDocument();
    expect(screen.getByText(/Expires: 12\/2025/)).toBeInTheDocument();

    expect(screen.getByText(/mastercard/i)).toBeInTheDocument();
    expect(screen.getByText(/**** **** **** 5555/)).toBeInTheDocument();
    expect(screen.getByText(/Expires: 10\/2026/)).toBeInTheDocument();

    const cardElements = screen.getAllByText(/**** **** **** /);
    expect(cardElements).toHaveLength(mockCards.length);
  });

  it('displays correct brand and last four digits for each card', () => {
    render(<SavedCardsList cards={mockCards} />);

    expect(screen.getByText('visa')).toBeInTheDocument();
    expect(screen.getByText('**** **** **** 4242')).toBeInTheDocument();

    expect(screen.getByText('mastercard')).toBeInTheDocument();
    expect(screen.getByText('**** **** **** 5555')).toBeInTheDocument();
  });

  it('displays correct expiration month and year for each card', () => {
    render(<SavedCardsList cards={mockCards} />);

    expect(screen.getByText('Expires: 12/2025')).toBeInTheDocument();
    expect(screen.getByText('Expires: 10/2026')).toBeInTheDocument();
  });

  it('renders correctly with a single card', () => {
    const singleCard: SavedCard[] = [mockCards[0]];
    render(<SavedCardsList cards={singleCard} />);

    expect(screen.getByText(/visa/i)).toBeInTheDocument();
    expect(screen.getByText(/**** **** **** 4242/)).toBeInTheDocument();
    expect(screen.getByText(/Expires: 12\/2025/)).toBeInTheDocument();

    const cardElements = screen.getAllByText(/**** **** **** /);
    expect(cardElements).toHaveLength(singleCard.length);
  });
});
