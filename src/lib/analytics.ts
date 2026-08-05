// Typed Umami tracking helper (FK-019). No-ops gracefully when Umami is
// blocked by an ad-blocker or not yet loaded.
interface Umami {
  track?: (event: string, data?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    umami?: Umami
  }
}

export function track(event: string, data?: Record<string, unknown>): void {
  window.umami?.track?.(event, data)
}
