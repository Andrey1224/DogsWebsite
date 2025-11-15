import { LoginForm } from './login-form';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-wide text-muted">Admin Console</p>
          <h1 className="text-3xl font-semibold text-text">Sign in</h1>
          <p className="text-sm text-muted">Use the credentials provided in your secure handoff.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
