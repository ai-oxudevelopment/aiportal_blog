// frontend/src/components/__tests__/Layout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

// Mock the child components
jest.mock('../Header', () => {
  return function MockHeader({ onToggleMenu, isMenuOpen }: any) {
    return (
      <header data-testid="header">
        <button onClick={onToggleMenu} data-testid="menu-toggle">
          {isMenuOpen ? 'Close' : 'Open'} Menu
        </button>
      </header>
    );
  };
});

jest.mock('../Sidebar', () => {
  return function MockSidebar({ isMenuOpen }: any) {
    return (
      <aside data-testid="sidebar" data-open={isMenuOpen}>
        Sidebar Content
      </aside>
    );
  };
});

jest.mock('../Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer Content</footer>;
  };
});

describe('Layout Component', () => {
  it('renders with all components by default', () => {
    render(
      <Layout>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('can hide sidebar when showSidebar is false', () => {
    render(
      <Layout showSidebar={false}>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('can hide footer when showFooter is false', () => {
    render(
      <Layout showFooter={false}>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(
      <Layout>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );

    // Check for proper semantic HTML
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside/sidebar
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
  });
});
