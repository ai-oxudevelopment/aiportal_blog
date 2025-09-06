// frontend/src/components/__tests__/SearchBar.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SearchBar from '../SearchBar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar />);
    
    expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="Custom search..." />);
    
    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'AI' } });

    await waitFor(() => {
      expect(screen.getByText('AI safety research')).toBeInTheDocument();
    });
  });

  it('navigates to search page on form submit', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(form!);

    expect(mockPush).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('calls onSearch callback when provided', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(form!);

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears search when clear button is clicked', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('has proper accessibility attributes', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Search articles...');
  });
});
