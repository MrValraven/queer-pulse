/**
 * The page behind the "page crash" simulation. It throws on every render, so
 * the route ErrorBoundary shows the real crash screen. "Try again" re-renders
 * it and it throws again, which also previews the escalation to "Reload the
 * page". Only registered on the dev server (see ./routes.tsx).
 */
export function CrashOnRender(): never {
  throw new Error("Simulated page crash (simulations preview)");
}
