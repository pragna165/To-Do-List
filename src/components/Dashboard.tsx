import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
  Table as TableIcon,
  X,
} from 'lucide-react';
import {
  createTask,
  deleteTask,
  fetchTasks,
  loadGuestTasks,
  probeAnonSupabaseAccess,
  saveGuestTasks,
  syncGuestTasksToSupabase,
  updateTask,
  updateTaskStatus,
} from '../services/taskService';
import {
  Task,
  TaskFilterPriority,
  TaskFilterStatus,
  TaskFormInput,
  TaskPriority,
  TaskStats,
  TaskStatus,
  TaskViewMode,
  ToastMessage,
} from '../types/task';
import { AddTaskForm } from './AddTaskForm';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { EditTaskForm } from './EditTaskForm';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TaskList } from './TaskList';
import { ToastContainer } from './ToastContainer';

interface DashboardProps {
  userId: string | null;
  userEmail: string | null;
  onOpenAuthModal: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

const STATUS_TABS: { label: string; value: TaskFilterStatus }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: TaskStatus.PENDING },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'Completed', value: TaskStatus.COMPLETED },
];

export function Dashboard({
  userId,
  userEmail,
  onOpenAuthModal,
  onLogout,
  isLoggingOut,
}: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useSupabaseBackend, setUseSupabaseBackend] = useState<boolean>(Boolean(userId));

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [quickDueDate, setQuickDueDate] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskFilterStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskFilterPriority>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'due_date' | 'priority'>('newest');
  const [viewMode, setViewMode] = useState<TaskViewMode>('cards');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (variant: ToastMessage['variant'], title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, variant, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (userId) {
        const migratedCount = await syncGuestTasksToSupabase(userId).catch(() => 0);
        const data = await fetchTasks(userId);
        setUseSupabaseBackend(true);
        setTasks(data);
        if (migratedCount > 0) {
          addToast(
            'success',
            'Workspace synced',
            `Uploaded ${migratedCount} task(s) to your Supabase database.`
          );
        }
        return;
      }

      const anonAllowed = await probeAnonSupabaseAccess();
      if (anonAllowed) {
        const data = await fetchTasks(null);
        setUseSupabaseBackend(true);
        setTasks(data);
      } else {
        setUseSupabaseBackend(false);
        setTasks(loadGuestTasks());
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tasks.';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const stats: TaskStats = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;

    for (const task of tasks) {
      if (task.status === TaskStatus.PENDING) pending += 1;
      else if (task.status === TaskStatus.IN_PROGRESS) inProgress += 1;
      else if (task.status === TaskStatus.COMPLETED) completed += 1;
    }

    return {
      total: tasks.length,
      pending,
      inProgress,
      completed,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const priorityRank: Record<TaskPriority, number> = {
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1,
    };

    return tasks
      .filter((task) => {
        if (statusFilter !== 'All' && task.status !== statusFilter) {
          return false;
        }
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
          return false;
        }
        if (query) {
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = (task.description ?? '').toLowerCase().includes(query);
          return matchesTitle || matchesDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityRank[b.priority] - priorityRank[a.priority];
        }
        if (sortBy === 'due_date') {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All';

  function handleResetFilters() {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  }

  async function handleCreateTask(values: TaskFormInput) {
    setIsSubmittingAdd(true);
    try {
      if (useSupabaseBackend) {
        const created = await createTask(userId, values);
        setTasks((prev) => [created, ...prev]);
        setIsAddModalOpen(false);
        addToast('success', 'Task created', `"${created.title}" saved to Supabase.`);
      } else {
        const newTask: Task = {
          id: crypto.randomUUID(),
          user_id: 'workspace',
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          due_date: values.due_date ? values.due_date : null,
          status: values.status,
          created_at: new Date().toISOString(),
        };
        setTasks((prev) => {
          const next = [newTask, ...prev];
          saveGuestTasks(next);
          return next;
        });
        setIsAddModalOpen(false);
        addToast('success', 'Task created', `"${newTask.title}" added to your list.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create task.';
      addToast('error', 'Create failed', message);
    } finally {
      setIsSubmittingAdd(false);
    }
  }

  async function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = quickTitle.trim();
    if (trimmed.length < 2) {
      addToast('error', 'Title required', 'Enter at least 2 characters for the task title.');
      return;
    }

    setIsQuickAdding(true);
    try {
      await handleCreateTask({
        title: trimmed,
        description: '',
        priority: quickPriority,
        due_date: quickDueDate,
        status: TaskStatus.PENDING,
      });
      setQuickTitle('');
      setQuickDueDate('');
      setQuickPriority(TaskPriority.MEDIUM);
    } finally {
      setIsQuickAdding(false);
    }
  }

  async function handleUpdateTask(taskId: string, values: TaskFormInput) {
    setIsSubmittingEdit(true);
    try {
      if (useSupabaseBackend) {
        const updated = await updateTask(taskId, userId, values);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        setEditingTask(null);
        addToast('success', 'Task updated', `"${updated.title}" changes saved.`);
      } else {
        setTasks((prev) => {
          const next = prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  title: values.title.trim(),
                  description: values.description.trim(),
                  priority: values.priority,
                  due_date: values.due_date ? values.due_date : null,
                  status: values.status,
                }
              : t
          );
          saveGuestTasks(next);
          return next;
        });
        setEditingTask(null);
        addToast('success', 'Task updated', `"${values.title.trim()}" changes saved.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      addToast('error', 'Update failed', message);
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  async function handleStatusChange(taskId: string, nextStatus: TaskStatus) {
    const previousTasks = tasks;
    const target = tasks.find((t) => t.id === taskId);
    setUpdatingStatusId(taskId);

    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      );
      if (!useSupabaseBackend) {
        saveGuestTasks(next);
      }
      return next;
    });

    try {
      if (useSupabaseBackend) {
        const updated = await updateTaskStatus(taskId, userId, nextStatus);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
      addToast(
        'success',
        nextStatus === TaskStatus.COMPLETED ? 'Task completed' : 'Status updated',
        target ? `"${target.title}" is now ${nextStatus}.` : `Moved to ${nextStatus}.`
      );
    } catch (err) {
      setTasks(previousTasks);
      const message =
        err instanceof Error ? err.message : 'Unable to update task status.';
      addToast('error', 'Status update failed', message);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return;
    const targetTask = deletingTask;
    setIsDeleting(true);

    try {
      if (useSupabaseBackend) {
        await deleteTask(targetTask.id, userId);
      }
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== targetTask.id);
        if (!useSupabaseBackend) {
          saveGuestTasks(next);
        }
        return next;
      });
      setDeletingTask(null);
      addToast('success', 'Task deleted', `"${targetTask.title}" has been removed.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete task.';
      addToast('error', 'Delete failed', message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeStatus={statusFilter}
        onSelectStatus={setStatusFilter}
        activePriority={priorityFilter}
        onSelectPriority={setPriorityFilter}
        stats={stats}
        userEmail={userEmail}
        isCloudSynced={useSupabaseBackend}
        onOpenAuthModal={onOpenAuthModal}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          userEmail={userEmail}
          isCloudSynced={useSupabaseBackend}
          activeStatus={statusFilter}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAuthModal={onOpenAuthModal}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Task Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Organize priorities, track due dates, and complete tasks effortlessly.
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500 tabular-nums">
              Showing {filteredTasks.length} of {stats.total} tasks
            </p>
          </div>

          <section
            aria-label="Task statistics"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Tasks</p>
                <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {stats.total}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Layers className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-amber-700">Pending</p>
                <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
                  {stats.pending}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ListTodo className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-sky-700">In Progress</p>
                <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Clock className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Completed</p>
                <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
                  {stats.completed}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          </section>

          <form
            onSubmit={handleQuickAdd}
            aria-label="Quick add task"
            className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            <input
              type="text"
              aria-label="Quick task title"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              maxLength={120}
              placeholder="Quick add a task (e.g., Prepare presentation slides)..."
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <select
                aria-label="Quick task priority"
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                className="px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value={TaskPriority.LOW}>Low Priority</option>
                <option value={TaskPriority.MEDIUM}>Medium Priority</option>
                <option value={TaskPriority.HIGH}>High Priority</option>
              </select>

              <input
                type="date"
                aria-label="Quick task due date"
                value={quickDueDate}
                onChange={(e) => setQuickDueDate(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <button
                type="submit"
                disabled={isQuickAdding}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{isQuickAdding ? 'Adding...' : 'Quick Add'}</span>
              </button>
            </div>
          </form>

          <section
            aria-label="Search and filter controls"
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
          >
            <div className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title or description..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div
                role="tablist"
                aria-label="Filter by task status"
                className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl"
              >
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                        isActive
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as TaskFilterPriority)
                }
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Priorities</option>
                <option value={TaskPriority.HIGH}>High Priority</option>
                <option value={TaskPriority.MEDIUM}>Medium Priority</option>
                <option value={TaskPriority.LOW}>Low Priority</option>
              </select>

              <select
                aria-label="Sort tasks"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'due_date' | 'priority')
                }
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="newest">Sort: Newest</option>
                <option value="due_date">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
              </select>

              <div
                role="group"
                aria-label="Task view mode"
                className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  aria-label="Card grid view"
                  aria-pressed={viewMode === 'cards'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                  aria-pressed={viewMode === 'table'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {loadError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Unable to load tasks</p>
                  <p className="text-xs text-rose-700 mt-0.5">{loadError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void loadTasks()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-800 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          <TaskList
            tasks={filteredTasks}
            totalTaskCount={tasks.length}
            viewMode={viewMode}
            isLoading={isLoading}
            updatingStatusId={updatingStatusId}
            hasActiveFilters={hasActiveFilters}
            onStatusChange={(id, status) => void handleStatusChange(id, status)}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => setDeletingTask(task)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onResetFilters={handleResetFilters}
          />
        </main>
      </div>

      <AddTaskForm
        isOpen={isAddModalOpen}
        isSubmitting={isSubmittingAdd}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskForm
        task={editingTask}
        isSubmitting={isSubmittingEdit}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />

      <ConfirmDeleteModal
        task={deletingTask}
        isDeleting={isDeleting}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
