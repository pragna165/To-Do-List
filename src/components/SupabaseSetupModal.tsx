import { useState } from 'react';
import { Check, Copy, Database, X } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_user_id_created_at_idx
  ON public.tasks (user_id, created_at DESC);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);`;

export function SupabaseSetupModal({ isOpen, onClose }: SupabaseSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-setup-title"
    >
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 id="supabase-setup-title" className="text-lg font-semibold text-slate-900">
              Supabase Setup Reference
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              1. Required Environment Variables
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Add your Supabase Project URL and public anon key (never the service_role key) to your environment configuration:
            </p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs font-mono overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-900">
                2. Tasks Table Schema & RLS Policies
              </h3>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied SQL
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Run this script inside your Supabase dashboard under SQL Editor:
            </p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs font-mono overflow-x-auto leading-relaxed">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
