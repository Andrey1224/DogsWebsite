'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import { initialLoginState } from './state';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(authenticate, initialLoginState);

  const loginError = state.errors?.login?.[0];
  const passwordError = state.errors?.password?.[0];
  const formError = state.errors?.form?.[0];

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
    >
      <div>
        <label htmlFor="login" className="text-sm font-medium text-text">
          Login
        </label>
        <input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          disabled={pending}
          aria-invalid={loginError ? 'true' : undefined}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
          placeholder="owner@example.com"
        />
        {loginError ? (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {loginError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-text">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          aria-invalid={passwordError ? 'true' : undefined}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"
          placeholder="••••••••"
        />
        {passwordError ? (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {passwordError}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[color:var(--btn-bg,#0D1A44)] px-4 py-2 text-center text-[color:var(--btn-text,#FFFFFF)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
