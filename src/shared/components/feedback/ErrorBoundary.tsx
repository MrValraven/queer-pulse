import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "../../observability/logger";
import { PageShell } from "../layout/PageShell";
import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  level?: "app" | "route";
  /** When this changes, the boundary auto-resets (e.g. route pathname). */
  resetKey?: string;
  /** Custom fallback; defaults to the branded plum crash screen. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  /** How many times "Try again" was pressed since the last navigation. After
   *  one failed retry the fallback offers a full reload instead. */
  retryCount: number;
}

/**
 * The one sanctioned class component (React still requires a class for
 * `getDerivedStateFromError`). Contains render errors so a single broken page
 * or provider can't blank the whole app, logs through the shared logger, and
 * auto-resets when `resetKey` changes so navigating away clears a stuck error.
 *
 * At the route level the crashed page took its own PageShell down with it, and
 * with it the shell-frame registration that makes AppChrome draw the navbar,
 * the bottom tab bar and the footer. The default fallback is therefore wrapped
 * in a fresh PageShell, so the visitor keeps the whole frame and a way out. If
 * that shell itself throws, the error climbs to the app-level boundary, which
 * needs no router or frame at all.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    const hasResetKeyChanged = previousProps.resetKey !== this.props.resetKey;
    const hasStateToClear =
      this.state.error !== null || this.state.retryCount > 0;
    if (hasResetKeyChanged && hasStateToClear) {
      this.setState({ error: null, retryCount: 0 });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error, {
      componentStack: info.componentStack,
      level: this.props.level ?? "app",
    });
  }

  reset = (): void =>
    this.setState((previousState) => ({
      error: null,
      retryCount: previousState.retryCount + 1,
    }));

  render(): ReactNode {
    const { error, retryCount } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      const level = this.props.level ?? "app";
      const fallback = (
        <ErrorFallback
          level={level}
          onReset={this.reset}
          hasRetried={retryCount > 0}
        />
      );
      return level === "route" ? <PageShell>{fallback}</PageShell> : fallback;
    }
    return this.props.children;
  }
}
