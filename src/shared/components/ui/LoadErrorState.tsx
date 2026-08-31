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
  className?: string;
}

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
  className,
}: LoadErrorStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      className={className}
      compact={compact}
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
          ? { label: t("shared:loadError.retryCta"), onClick: onRetry }
          : undefined
      }
    />
  );
}
