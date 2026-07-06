import { format, parseISO } from 'date-fns';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isJournalDateOnly(date: string): boolean {
  return DATE_ONLY_RE.test(date);
}

export function parseJournalDate(date: string): Date {
  return DATE_ONLY_RE.test(date) ? parseISO(date) : new Date(date);
}

export function getJournalDateKey(date: string): string {
  return format(parseJournalDate(date), 'yyyy-MM-dd');
}

export function formatJournalDate(date: string, formatString: string): string {
  return format(parseJournalDate(date), formatString);
}
