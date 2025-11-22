'use client';

import { useActionState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { authenticate } from './actions';
import { initialLoginState } from './state';

type LoginFormProps = {
  supportEmail: string;
};

export function LoginForm({ supportEmail }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(authenticate, initialLoginState);

  const loginError = state.errors?.login?.[0];
  const passwordError = state.errors?.password?.[0];
  const formError = state.errors?.form?.[0];

  return (
    <form
      action={formAction}
      className="relative space-y-6 overflow-hidden rounded-[2rem] border border-slate-700/50 bg-[#1E293B]/60 p-8 shadow-2xl backdrop-blur-xl md:p-10"
    >
      <div
        className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-orange-500 to-purple-600"
        aria-hidden
      />

      <div className="space-y-2 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Admin Console
        </p>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-slate-500">Enter your credentials to access the dashboard.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="login"
            className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
          >
            Email Address
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail
                size={18}
                className={`text-slate-500 transition-colors group-focus-within:text-orange-400 ${
                  loginError ? 'text-red-400' : ''
                }`}
              />
            </div>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              disabled={pending}
              aria-invalid={loginError ? 'true' : undefined}
              className={`w-full rounded-xl border bg-[#0B1120] py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all ${
                loginError
                  ? 'border-red-500/70 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                  : 'border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              } disabled:cursor-not-allowed disabled:opacity-70`}
              placeholder="owner@example.com"
            />
          </div>
          {loginError ? (
            <p className="text-xs text-red-400" role="alert">
              {loginError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
          >
            Password
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock
                size={18}
                className={`text-slate-500 transition-colors group-focus-within:text-orange-400 ${
                  passwordError ? 'text-red-400' : ''
                }`}
              />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={pending}
              aria-invalid={passwordError ? 'true' : undefined}
              className={`w-full rounded-xl border bg-[#0B1120] py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all ${
                passwordError
                  ? 'border-red-500/70 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                  : 'border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              } disabled:cursor-not-allowed disabled:opacity-70`}
              placeholder="••••••••"
            />
          </div>
          {passwordError ? (
            <p className="text-xs text-red-400" role="alert">
              {passwordError}
            </p>
          ) : null}
        </div>
      </div>

      {formError ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle size={16} />
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In{' '}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="text-center text-xs font-medium text-slate-500">
        <a
          href={`mailto:${supportEmail}?subject=Admin%20access%20help`}
          className="transition-colors hover:text-orange-400"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}
