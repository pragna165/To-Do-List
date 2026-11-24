import { FormEvent, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Task, TaskFormInput, TaskPriority, TaskStatus } from '../types/task';
import {
  formatShortDate,
  formatShortId,
  TaskFormErrors,
  validateTaskForm,
} from '../utils/validation';

interface EditTaskFormProps {
  task: Task | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, values: TaskFormInput) => Promise<void>;
}

export function EditTaskForm({
  task,
  isSubmitting,
  onClose,
  onSubmit,
}: EditTaskFormProps) {
  const [values, setValues] = useState<TaskFormInput>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    due_date: '',
    status: TaskStatus.PENDING,
  });
  const [errors, setErrors] = useState<TaskFormErrors>({});

  useEffect(() => {
    if (task) {
      setValues({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        status: task.status,
      });
      setErrors({});
    }
  }, [task]);

  if (!task) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;

    const validationErrors = validateTaskForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(task.id, values);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="edit-task-title" className="font-display text-lg font-semibold text-slate-900">
              Edit Task
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
              ID {formatShortId(task.id)} · Created {formatShortDate(task.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-task-title-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              Task Title <span className="text-red-600">*</span>
            </label>
            <input
              id="edit-task-title-input"
              type="text"
              maxLength={120}
              value={values.title}
              onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                errors.title ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="edit-task-desc-input" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {values.description.length}/1000
              </span>
            </div>
            <textarea
              id="edit-task-desc-input"
              rows={3}
              maxLength={1000}
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                errors.description ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="edit-task-priority" className="block text-sm font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                id="edit-task-priority"
                value={values.priority}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    priority: e.target.value as TaskPriority,
                  }))
                }
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-task-status" className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                id="edit-task-status"
                value={values.status}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus,
                  }))
                }
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <option value={TaskStatus.PENDING}>Pending</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-task-due-date" className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                id="edit-task-due-date"
                type="date"
                value={values.due_date}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, due_date: e.target.value }))
                }
                className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                  errors.due_date ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.due_date && (
                <p className="mt-1.5 text-xs text-red-600">{errors.due_date}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
