import { TaskFormInput, TaskPriority, TaskStatus } from '../types/task';

export interface TaskFormErrors {
  title?: string;
  description?: string;
  priority?: string;
  due_date?: string;
  status?: string;
}

const VALID_PRIORITIES = new Set<string>(Object.values(TaskPriority));
const VALID_STATUSES = new Set<string>(Object.values(TaskStatus));

export function validateTaskForm(values: TaskFormInput): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const trimmedTitle = values.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Task title is required.';
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Task title must be at least 2 characters.';
  } else if (trimmedTitle.length > 120) {
    errors.title = 'Task title cannot exceed 120 characters.';
  }

  if (values.description.length > 1000) {
    errors.description = 'Description cannot exceed 1,000 characters.';
  }

  if (!VALID_PRIORITIES.has(values.priority)) {
    errors.priority = 'Select a valid priority level.';
  }

  if (!VALID_STATUSES.has(values.status)) {
    errors.status = 'Select a valid task status.';
  }

  if (values.due_date) {
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(values.due_date);
    const parsedDate = new Date(`${values.due_date}T00:00:00`);
    if (!isIsoDate || Number.isNaN(parsedDate.getTime())) {
      errors.due_date = 'Enter a valid due date.';
    }
  }

  return errors;
}

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return undefined;
}

export function formatShortDate(dateValue: string | null): string {
  if (!dateValue) return 'No due date';
  const normalized = dateValue.includes('T') ? dateValue : `${dateValue}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isTaskOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === TaskStatus.COMPLETED) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < today.getTime();
}

export function formatShortId(uuid: string): string {
  return uuid.slice(0, 8).toUpperCase();
}
