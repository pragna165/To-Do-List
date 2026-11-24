import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckSquare, Database } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { validateEmail, validatePassword } from '../utils/validation';

interface LoginProps {
  onSwitchToSignup: () => void;
  onOpenSetupGuide: () => void;
  onAuthSuccess: (email: string) => void;
}

export function Login({
  onSwitchToSignup,
  onOpenSetupGuide,
  onAuthSuccess,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUnconfirmedError =
    formError?.toLowerCase().includes('email not confirmed') ?? false;

  async function handleResendConfirmation() {
    if (!email.trim() || !isSupabaseConfigured) return;
    setIsResending(true);
    setResendNotice(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setFormError(error.message);
      } else {
        setResendNotice('Confirmation email sent. Check your inbox and spam folder.');
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to resend confirmation email.'
      );
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setResendNotice(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setFieldErrors({});

    if (!isSupabaseConfigured) {
      setFormError(
        'Supabase environment variables are not configured yet. Open the setup reference below to configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.user) {
        onAuthSuccess(data.user.email ?? email.trim());
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <div className="lg:w-5/12 bg-slate-900 text-white px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-indigo-400" aria-hidden="true" />
            <span className="font-display text-xl font-bold tracking-tight whitespace-nowrap">
              TaskFlow
            </span>
          </div>

          <div className="mt-14 max-w-md">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-white [text-wrap:balance]">
              Organize priorities and ship work on schedule.
            </h1>
            <p className="mt-4 text-sm lg:text-base text-slate-300 leading-relaxed">
              A focused task workspace backed by your Supabase database with per-user row security, instant status updates, and structured priority tracking.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-semibold text-white">Row-Level Isolation</p>
              <p className="mt-1 text-slate-400 leading-relaxed">
                Each account accesses only its own authenticated tasks.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Real-Time Counters</p>
              <p className="mt-1 text-slate-400 leading-relaxed">
                Pending, in-progress, and completed totals stay synchronized.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              Sign in to TaskFlow
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Enter your account credentials to open your workspace.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold">Supabase connection pending</p>
                <p className="leading-relaxed text-amber-800">
                  Add <code className="font-mono font-medium">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-mono font-medium">VITE_SUPABASE_ANON_KEY</code> to connect authentication and task storage.
                </p>
                <button
                  type="button"
                  onClick={onOpenSetupGuide}
                  className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
                >
                  View SQL schema & setup steps
                </button>
              </div>
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1.5">
                <span>{formError}</span>
                {isUnconfirmedError && (
                  <div>
                    <button
                      type="button"
                      onClick={() => void handleResendConfirmation()}
                      disabled={isResending}
                      className="text-xs font-semibold text-red-900 underline underline-offset-2 hover:text-red-700 disabled:opacity-60"
                    >
                      {isResending ? 'Sending confirmation...' : 'Resend confirmation email'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {resendNotice && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900"
            >
              {resendNotice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                  fieldErrors.email ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                    fieldErrors.password ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              New to TaskFlow?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                Create an account
              </button>
            </span>
            <button
              type="button"
              onClick={onOpenSetupGuide}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              SQL Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
