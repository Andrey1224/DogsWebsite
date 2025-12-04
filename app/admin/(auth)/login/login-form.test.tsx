import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './login-form';

// Mock useActionState
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="icon-alert" />,
  ArrowRight: () => <span data-testid="icon-arrow" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Lock: () => <span data-testid="icon-lock" />,
  Mail: () => <span data-testid="icon-mail" />,
}));

import { useActionState } from 'react';

describe('LoginForm', () => {
  const mockAction = vi.fn();
  const defaultProps = { supportEmail: 'support@example.com' };

  it('renders login form with initial state', () => {
    // Mock state: no errors, not pending
    (useActionState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      {},
      mockAction,
      false,
    ]);

    render(<LoginForm {...defaultProps} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays validation errors for fields', () => {
    const errorState = {
      errors: {
        login: ['Invalid email format'],
        password: ['Password too short'],
      },
    };
    (useActionState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      errorState,
      mockAction,
      false,
    ]);

    render(<LoginForm {...defaultProps} />);

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Password too short')).toBeInTheDocument();

    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays form-level error', () => {
    const errorState = {
      errors: {
        form: ['Invalid credentials'],
      },
    };
    (useActionState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      errorState,
      mockAction,
      false,
    ]);

    render(<LoginForm {...defaultProps} />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });

  it('shows loading state when pending is true', () => {
    (useActionState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([{}, mockAction, true]);

    render(<LoginForm {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();

    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });

  it('renders forgot password link', () => {
    (useActionState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      {},
      mockAction,
      false,
    ]);

    render(<LoginForm {...defaultProps} />);

    const link = screen.getByRole('link', { name: /forgot your password/i });
    expect(link).toHaveAttribute(
      'href',
      'mailto:support@example.com?subject=Admin%20access%20help',
    );
  });
});
