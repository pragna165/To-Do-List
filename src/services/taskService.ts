import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskFormInput, TaskStatus } from '../types/task';

const TASK_COLUMNS =
  'id, user_id, title, description, priority, due_date, status, created_at';

const GUEST_STORAGE_KEY = 'taskflow_instant_tasks_v1';

export function loadGuestTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestTasks(tasks: Task[]): void {
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota issues
  }
}

export function clearGuestTasks(): void {
  try {
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export async function probeAnonSupabaseAccess(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('tasks').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTasks(userId: string | null): Promise<Task[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Unable to load tasks from the database.');
  }

  return (data ?? []) as Task[];
}

export async function createTask(
  userId: string | null,
  input: TaskFormInput
): Promise<Task> {
  const supabase = getSupabaseClient();

  const basePayload = {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    due_date: input.due_date ? input.due_date : null,
    status: input.status,
  };

  const payload = userId ? { ...basePayload, user_id: userId } : basePayload;

  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message || 'Unable to create task.');
  }

  return data as Task;
}

export async function updateTask(
  taskId: string,
  userId: string | null,
  input: TaskFormInput
): Promise<Task> {
  const supabase = getSupabaseClient();

  const payload = {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    due_date: input.due_date ? input.due_date : null,
    status: input.status,
  };

  let query = supabase.from('tasks').update(payload).eq('id', taskId);
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.select(TASK_COLUMNS).single();

  if (error) {
    throw new Error(error.message || 'Unable to update task.');
  }

  return data as Task;
}

export async function updateTaskStatus(
  taskId: string,
  userId: string | null,
  status: TaskStatus
): Promise<Task> {
  const supabase = getSupabaseClient();

  let query = supabase.from('tasks').update({ status }).eq('id', taskId);
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.select(TASK_COLUMNS).single();

  if (error) {
    throw new Error(error.message || 'Unable to update task status.');
  }

  return data as Task;
}

export async function deleteTask(
  taskId: string,
  userId: string | null
): Promise<void> {
  const supabase = getSupabaseClient();

  let query = supabase.from('tasks').delete().eq('id', taskId);
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message || 'Unable to delete task.');
  }
}

export async function syncGuestTasksToSupabase(userId: string): Promise<number> {
  const guestTasks = loadGuestTasks();
  if (guestTasks.length === 0) return 0;

  const supabase = getSupabaseClient();
  const rows = guestTasks.map((t) => ({
    user_id: userId,
    title: t.title,
    description: t.description ?? '',
    priority: t.priority,
    due_date: t.due_date,
    status: t.status,
  }));

  const { error } = await supabase.from('tasks').insert(rows);
  if (error) {
    throw new Error(error.message || 'Unable to sync local tasks to Supabase.');
  }

  clearGuestTasks();
  return rows.length;
}
