// Test-specific window extensions
declare global {
  interface Window {
    __gtagCalls?: unknown[];
    __fbqCalls?: unknown[];
  }
}

export {};
