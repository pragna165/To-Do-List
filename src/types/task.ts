export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export type TaskFilterStatus = 'All' | TaskStatus;
export type TaskFilterPriority = 'All' | TaskPriority;
export type TaskViewMode = 'cards' | 'table';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
}

export interface TaskFormInput {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
  status: TaskStatus;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}
