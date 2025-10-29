import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth context
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    login: mockLogin,
    user: null,
    token: null,
    isLoading: false,
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByText('HRIS System')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays test credentials', () => {
    renderLogin();
    expect(screen.getByText(/admin@hris.com/)).toBeInTheDocument();
    expect(screen.getByText(/hr@hris.com/)).toBeInTheDocument();
  });

  it('allows entering email and password', () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login function on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state while signing in', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
