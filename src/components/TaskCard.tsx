import { Check, Pencil, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import {
  formatShortDate,
  formatShortId,
  isTaskOverdue,
} from '../utils/validation';

interface TaskCardProps {
  task: Task;
  isUpdatingStatus: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_TEXT_CLASS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: 'text-rose-600 font-semibold',
  [TaskPriority.MEDIUM]: 'text-amber-600 font-semibold',
  [TaskPriority.LOW]: 'text-emerald-600 font-semibold',
};

const STATUS_SELECT_CLASS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'text-amber-800 border-amber-200 bg-amber-50',
  [TaskStatus.IN_PROGRESS]: 'text-sky-800 border-sky-200 bg-sky-50',
  [TaskStatus.COMPLETED]: 'text-emerald-800 border-emerald-200 bg-emerald-50',
};

export function TaskCard({
  task,
  isUpdatingStatus,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task.due_date, task.status);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  function handleToggleCompleted() {
    onStatusChange(
      task.id,
      isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED
    );
  }

  return (
    <article
      className={`bg-white border rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-150 ${
        isCompleted
          ? 'border-emerald-200/80 bg-emerald-50/20'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={handleToggleCompleted}
              disabled={isUpdatingStatus}
              aria-label={
                isCompleted
                  ? `Mark "${task.title}" as pending`
                  : `Mark "${task.title}" as completed`
              }
              aria-pressed={isCompleted}
              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60 ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-300 hover:border-indigo-500 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
            </button>

            <h3
              className={`font-display text-base font-semibold leading-snug break-words ${
                isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.title}`}
              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete task ${task.title}`}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {task.description ? (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 pl-8">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic pl-8">
            No description provided.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pt-1 pl-8">
          <span className="font-mono tabular-nums text-slate-400">
            #{formatShortId(task.id)}
          </span>
          <span aria-hidden="true">·</span>
          <span className={PRIORITY_TEXT_CLASS[task.priority]}>
            {task.priority} priority
          </span>
          <span aria-hidden="true">·</span>
          <span className={`tabular-nums ${overdue ? 'text-rose-600 font-semibold' : ''}`}>
            {task.due_date
              ? `${overdue ? 'Overdue · ' : 'Due '}${formatShortDate(task.due_date)}`
              : 'No due date'}
          </span>
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          Created {formatShortDate(task.created_at)}
        </span>

        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Task status
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          disabled={isUpdatingStatus}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`px-2.5 py-1.5 text-xs font-semibold border rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
            STATUS_SELECT_CLASS[task.status]
          }`}
        >
          <option value={TaskStatus.PENDING}>Pending</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
        </select>
      </div>
    </article>
  );
}
