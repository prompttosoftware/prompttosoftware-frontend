import React from 'react';
import { render, screen } from '@testing-library/react';
import TestComponent from './TestComponent';

describe('TestComponent', () => {
  it('renders a simple div', () => {
    render(<TestComponent />);
    expect(screen.getByText(/Hello Test!/i)).toBeInTheDocument();
  });
});
