'use client';

import { useMemo } from 'react';

import { useTheme } from '@/components/theme-provider';

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
] as const;

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const helperLabel = useMemo(() => {
    if (theme !== 'system') {
      return null;
    }
    return resolvedTheme === 'dark' ? 'System dark' : 'System light';
  }, [resolvedTheme, theme]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 shadow-sm">
        {OPTIONS.map((option) => {
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-aux ${
                isActive
                  ? 'bg-[color:var(--btn-bg)] text-[color:var(--btn-text)] shadow'
                  : 'text-muted hover:bg-[color:var(--hover)]'
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {helperLabel ? <span className="text-xs text-muted">{helperLabel}</span> : null}
    </div>
  );
}
