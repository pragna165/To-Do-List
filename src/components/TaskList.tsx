import { Check, ClipboardList, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskViewMode } from '../types/task';
import {
  formatShortDate,
  formatShortId,
  isTaskOverdue,
} from '../utils/validation';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  totalTaskCount: number;
  viewMode: TaskViewMode;
  isLoading: boolean;
  updatingStatusId: string | null;
  hasActiveFilters: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenAddModal: () => void;
  onResetFilters: () => void;
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

export function TaskList({
  tasks,
  totalTaskCount,
  viewMode,
  isLoading,
  updatingStatusId,
  hasActiveFilters,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenAddModal,
  onResetFilters,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading tasks"
        className={
          viewMode === 'cards'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'bg-white border border-slate-200 rounded-xl divide-y divide-slate-200'
        }
      >
        {[1, 2, 3, 4, 5, 6].map((item) =>
          viewMode === 'cards' ? (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-7 w-24 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ) : (
            <div key={item} className="px-5 py-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-7 w-24 bg-slate-200 rounded-lg" />
            </div>
          )
        )}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-16 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <ClipboardList className="w-6 h-6" aria-hidden="true" />
        </div>

        {totalTaskCount === 0 ? (
          <>
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
              Your task list is ready
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Use the quick-add bar above or click the button below to create your first task with a priority and due date.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Your First Task</span>
            </button>
          </>
        ) : (
          <>
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
              No matching tasks found
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'Try clearing your search query or adjusting the active status and priority filters.'
                : 'No tasks match this view.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isUpdatingStatus={updatingStatusId === task.id}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-10">Done</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {tasks.map((task) => {
              const overdue = isTaskOverdue(task.due_date, task.status);
              const isCompleted = task.status === TaskStatus.COMPLETED;
              return (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      disabled={updatingStatusId === task.id}
                      onClick={() =>
                        onStatusChange(
                          task.id,
                          isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED
                        )
                      }
                      aria-label={
                        isCompleted
                          ? `Mark "${task.title}" as pending`
                          : `Mark "${task.title}" as completed`
                      }
                      aria-pressed={isCompleted}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-400 whitespace-nowrap">
                    #{formatShortId(task.id)}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p
                      className={`font-medium truncate ${
                        isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                    <span className={PRIORITY_TEXT_CLASS[task.priority]}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs tabular-nums">
                    <span className={overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                      {task.due_date
                        ? `${overdue ? 'Overdue · ' : ''}${formatShortDate(task.due_date)}`
                        : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      aria-label={`Status for ${task.title}`}
                      value={task.status}
                      disabled={updatingStatusId === task.id}
                      onChange={(e) =>
                        onStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-colors cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                        STATUS_SELECT_CLASS[task.status]
                      }`}
                    >
                      <option value={TaskStatus.PENDING}>Pending</option>
                      <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 tabular-nums">
                    {formatShortDate(task.created_at)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        aria-label={`Edit task ${task.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        aria-label={`Delete task ${task.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
