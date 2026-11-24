import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Task } from '../types/task';

interface ConfirmDeleteModalProps {
  task: Task | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  task,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-base font-semibold text-slate-900">
                Delete task
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-medium text-slate-900">"{task.title}"</span>? This
                action removes the record permanently from your database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close confirmation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
