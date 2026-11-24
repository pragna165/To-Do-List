import { Cloud, LogIn, LogOut, Menu, Plus } from 'lucide-react';
import { TaskFilterStatus } from '../types/task';

interface NavbarProps {
  userEmail: string | null;
  isCloudSynced: boolean;
  activeStatus: TaskFilterStatus;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function Navbar({
  userEmail,
  isCloudSynced,
  activeStatus,
  onOpenMobileMenu,
  onOpenAddModal,
  onOpenAuthModal,
  onLogout,
  isLoggingOut,
}: NavbarProps) {
  const sectionLabel = activeStatus === 'All' ? 'All Tasks' : `${activeStatus} Tasks`;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-slate-500 hidden sm:inline whitespace-nowrap">
            TaskFlow
          </span>
          <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
            /
          </span>
          <span className="font-display font-semibold text-slate-900 truncate">
            {sectionLabel}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {userEmail ? (
          <>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium truncate max-w-[200px]">
              <Cloud className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{userEmail}</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Sign out"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </>
        ) : (
          !isCloudSynced && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <LogIn className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span className="hidden sm:inline">Cloud Sync</span>
            </button>
          )
        )}

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
