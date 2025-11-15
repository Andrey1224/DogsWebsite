import type { PostgrestError } from '@supabase/supabase-js';

type ArchiveColumnState = 'unknown' | 'available' | 'missing';

let archiveColumnState: ArchiveColumnState = 'unknown';
let hasWarnedAboutMissingColumn = false;

function logMissingColumnWarning() {
  if (hasWarnedAboutMissingColumn) {
    return;
  }

  hasWarnedAboutMissingColumn = true;
  console.warn(
    '[Supabase] The `puppies.is_archived` column is missing. Falling back to legacy behavior until migrations run.',
  );
}

export function shouldUseArchiveColumn(): boolean {
  return archiveColumnState !== 'missing';
}

export function markArchiveColumnAvailable(): void {
  archiveColumnState = 'available';
}

export function markArchiveColumnMissing(): void {
  archiveColumnState = 'missing';
  logMissingColumnWarning();
}

export function isArchiveColumnMissingError(error: PostgrestError | null): boolean {
  if (!error) {
    return false;
  }

  const referencesArchiveField =
    typeof error.message === 'string' && error.message.includes('is_archived');

  return error.code === '42703' && referencesArchiveField;
}

type ArchiveAwareResult<T> = {
  data: T | null;
  error: PostgrestError | null;
  usedArchiveColumn: boolean;
};

export type ArchiveAwareQueryExecutor<T> = (options: {
  useArchiveColumn: boolean;
}) => Promise<{ data: T | null; error: PostgrestError | null }>;

export async function runArchiveAwareQuery<T>(
  executor: ArchiveAwareQueryExecutor<T>,
): Promise<ArchiveAwareResult<T>> {
  const preferArchiveColumn = shouldUseArchiveColumn();
  const primaryResult = await executor({ useArchiveColumn: preferArchiveColumn });

  if (!primaryResult.error) {
    if (preferArchiveColumn) {
      markArchiveColumnAvailable();
    }

    return {
      data: primaryResult.data,
      error: null,
      usedArchiveColumn: preferArchiveColumn,
    };
  }

  if (preferArchiveColumn && isArchiveColumnMissingError(primaryResult.error)) {
    markArchiveColumnMissing();
    const fallbackResult = await executor({ useArchiveColumn: false });

    if (fallbackResult.error) {
      return {
        data: null,
        error: fallbackResult.error,
        usedArchiveColumn: false,
      };
    }

    return {
      data: fallbackResult.data,
      error: null,
      usedArchiveColumn: false,
    };
  }

  return {
    data: null,
    error: primaryResult.error,
    usedArchiveColumn: preferArchiveColumn,
  };
}
