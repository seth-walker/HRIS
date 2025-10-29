import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      role: 'employee',
    },
    logout: vi.fn(),
  }),
}));

describe('Layout Component', () => {
  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
  };

  it('renders the HRIS logo', () => {
    renderLayout();
    expect(screen.getByText('HRIS')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Org Chart')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    renderLayout();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderLayout();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays user email', () => {
    renderLayout();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });
});
