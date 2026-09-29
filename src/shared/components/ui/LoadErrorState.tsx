import type { ReactNode } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { EmptyState } from "./EmptyState";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";

export interface LoadErrorStateProps {
  /**
   * Re-runs the failed request — wire it to react-query's `refetch`. Omit only
   * when the surface genuinely has nothing to retry.
   */
  onRetry?: () => void;
  /** Overrides the generic title, e.g. "We couldn't load the clinic directory". */
  title?: ReactNode;
  /** Overrides the generic body copy. */
  description?: ReactNode;
  /** Tighter padding for inline/in-grid usage. */
  compact?: boolean;
  /**
   * The retry is in flight. Keep the panel mounted and pass this: the Retry
   * button stays in place (so keyboard focus stays on it), reads "Trying
   * again…", is `aria-disabled` and ignores presses until the read settles.
   * Defaults to `false`, which is the panel as it always was.
   */
  isRetrying?: boolean;
  /** Title heading level, forwarded to `EmptyState`. Defaults to `3`; pass `2`
   *  when the panel sits straight under the page `h1`. */
  headingLevel?: 2 | 3;
  className?: string;
}

// Swallows presses while a retry runs; the button stays focusable.
const ignorePress = () => {};

/**
 * The shared "we couldn't load this" panel. It exists to keep an outage from
 * being rendered as an empty state: a failed fetch must never tell a member
 * that there are no results, no places, or no clinics (DES-22 … DES-25).
 *
 * Reach for it wherever a query can fail. Pass `title`/`description` when the
 * surface can say what failed — the generic copy is the fallback, not the
 * target.
 */
export function LoadErrorState({
  onRetry,
  title,
  description,
  compact = false,
  isRetrying = false,
  headingLevel,
  className,
}: LoadErrorStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      className={className}
      compact={compact}
      headingLevel={headingLevel}
      icon={<FiAlertCircle />}
      title={
        title ?? (
          <Translation
            i18nKey="shared:loadError.title"
            components={{ em: <em /> }}
          />
        )
      }
      description={description ?? t("shared:loadError.body")}
      action={
        onRetry
          ? isRetrying
            ? {
                label: t("shared:loadError.retryingCta"),
                onClick: ignorePress,
                isBusy: true,
              }
            : { label: t("shared:loadError.retryCta"), onClick: onRetry }
          : undefined
      }
    />
  );
}
