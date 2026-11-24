import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Cloud,
  Flame,
  Layers,
  ListTodo,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import {
  TaskFilterPriority,
  TaskFilterStatus,
  TaskPriority,
  TaskStats,
  TaskStatus,
} from '../types/task';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeStatus: TaskFilterStatus;
  onSelectStatus: (status: TaskFilterStatus) => void;
  activePriority: TaskFilterPriority;
  onSelectPriority: (priority: TaskFilterPriority) => void;
  stats: TaskStats;
  userEmail: string | null;
  isCloudSynced: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function Sidebar({
  isMobileOpen,
  onCloseMobile,
  activeStatus,
  onSelectStatus,
  activePriority,
  onSelectPriority,
  stats,
  userEmail,
  isCloudSynced,
  onOpenAuthModal,
  onLogout,
  isLoggingOut,
}: SidebarProps) {
  const statusItems: {
    label: string;
    value: TaskFilterStatus;
    count: number;
    icon: typeof Layers;
    activeIconColor: string;
  }[] = [
    {
      label: 'All Tasks',
      value: 'All',
      count: stats.total,
      icon: Layers,
      activeIconColor: 'text-indigo-400',
    },
    {
      label: 'Pending',
      value: TaskStatus.PENDING,
      count: stats.pending,
      icon: ListTodo,
      activeIconColor: 'text-amber-400',
    },
    {
      label: 'In Progress',
      value: TaskStatus.IN_PROGRESS,
      count: stats.inProgress,
      icon: Clock,
      activeIconColor: 'text-sky-400',
    },
    {
      label: 'Completed',
      value: TaskStatus.COMPLETED,
      count: stats.completed,
      icon: CheckCircle2,
      activeIconColor: 'text-emerald-400',
    },
  ];

  const priorityItems: {
    label: string;
    value: TaskFilterPriority;
    accentClass: string;
  }[] = [
    { label: 'All Priorities', value: 'All', accentClass: 'text-slate-300' },
    { label: 'High Priority', value: TaskPriority.HIGH, accentClass: 'text-rose-400' },
    { label: 'Medium Priority', value: TaskPriority.MEDIUM, accentClass: 'text-amber-400' },
    { label: 'Low Priority', value: TaskPriority.LOW, accentClass: 'text-emerald-400' },
  ];

  function handleStatusClick(value: TaskFilterStatus) {
    onSelectStatus(value);
    onCloseMobile();
  }

  function handlePriorityClick(value: TaskFilterPriority) {
    onSelectPriority(value);
    onCloseMobile();
  }

  const completionPct =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800">
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <CheckSquare className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
            TaskFlow
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-7">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400">
            Task Views
          </p>
          <nav aria-label="Task status filters" className="space-y-1">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeStatus === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleStatusClick(item.value)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-indigo-600/25 text-white border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? item.activeIconColor : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive ? 'text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400">
            Priority Filter
          </p>
          <div className="space-y-1" role="group" aria-label="Priority filters">
            {priorityItems.map((item) => {
              const isActive = activePriority === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handlePriorityClick(item.value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                  }`}
                >
                  <Flame
                    className={`w-3.5 h-3.5 shrink-0 ${item.accentClass}`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-2 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Completion</span>
            <span className="font-mono font-semibold text-emerald-400 tabular-nums">
              {completionPct}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 tabular-nums">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
        {userEmail ? (
          <>
            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Supabase Synced</span>
              </p>
              <p className="text-xs font-medium text-slate-200 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              {isCloudSynced
                ? 'Connected to Supabase database.'
                : 'Sign in optionally to sync tasks across devices.'}
            </p>
            {!isCloudSynced && (
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenAuthModal();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign In / Cloud Sync</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
