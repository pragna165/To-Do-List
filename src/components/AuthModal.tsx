import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  X,
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { validateEmail, validatePassword } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const isUnconfirmedError =
    formError?.toLowerCase().includes('email not confirmed') ?? false;

  function switchMode(nextMode: 'login' | 'signup') {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setInfoNotice(null);
  }

  async function handleResendConfirmation() {
    if (!email.trim() || !isSupabaseConfigured) return;
    setIsResending(true);
    setInfoNotice(null);
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
        setInfoNotice('Confirmation email sent. Check your inbox and spam folder.');
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
    setInfoNotice(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    let confirmError: string | undefined;

    if (mode === 'signup') {
      if (!confirmPassword) {
        confirmError = 'Please confirm your password.';
      } else if (confirmPassword !== password) {
        confirmError = 'Passwords do not match.';
      }
    }

    if (emailError || passwordError || confirmError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError,
      });
      return;
    }

    setFieldErrors({});

    if (!isSupabaseConfigured) {
      setFormError('Supabase URL and key are not configured.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setFormError(error.message);
          return;
        }
        if (data.user) {
          onAuthenticated();
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) {
          setFormError(error.message);
          return;
        }
        if (data.session && data.user) {
          onAuthenticated();
          onClose();
        } else {
          setInfoNotice(
            'Account created. Check your inbox to verify your email, then sign in.'
          );
          setMode('login');
        }
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Authentication request failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="auth-modal-title" className="font-display text-lg font-semibold text-slate-900">
              {mode === 'login' ? 'Sign in to sync tasks' : 'Create Supabase account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Save and sync your tasks across devices with Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p>{formError}</p>
                {isUnconfirmedError && (
                  <button
                    type="button"
                    onClick={() => void handleResendConfirmation()}
                    disabled={isResending}
                    className="font-semibold underline underline-offset-2 text-red-900"
                  >
                    {isResending ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            </div>
          )}

          {infoNotice && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p>{infoNotice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                  fieldErrors.email ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-3.5 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.password ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.confirmPassword ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {isSubmitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
