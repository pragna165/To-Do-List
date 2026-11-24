import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ToastMessage } from '../types/task';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.variant === 'success';
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg transition-all duration-150"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
