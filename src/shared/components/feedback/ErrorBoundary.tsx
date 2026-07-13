import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "../../observability/logger";
import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  level?: "app" | "route";
  /** When this changes, the boundary auto-resets (e.g. route pathname). */
  resetKey?: string;
  /** Custom fallback; defaults to the branded plum panel. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * The one sanctioned class component (React still requires a class for
 * `getDerivedStateFromError`). Contains render errors so a single broken page
 * or provider can't blank the whole app, logs through the shared logger, and
 * auto-resets when `resetKey` changes so navigating away clears a stuck error.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prev: ErrorBoundaryProps): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error, {
      componentStack: info.componentStack,
      level: this.props.level ?? "app",
    });
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <ErrorFallback level={this.props.level ?? "app"} onReset={this.reset} />
      );
    }
    return this.props.children;
  }
}
