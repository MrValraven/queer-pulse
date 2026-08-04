import { EmptyState as SharedEmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import { EMPTIES, type EmptyAction } from "./empties.data";

/**
 * The empty-state card for a given dashboard bucket. A thin adapter over the
 * shared `EmptyState` primitive, driven by the `EMPTIES` data catalog: it
 * resolves the bucket's title/sub copy through `t()`, renders the stroke icon
 * in the shared tinted circle (via `currentColor`), and maps the bucket's
 * navigation/reset actions onto the primary + secondary action slots.
 */
export function EmptyState({ emptyKey }: { emptyKey: string }) {
  const { t } = useTranslation();
  const { clearDay, clearSecondary } = useMyEvents();
  const cfg = EMPTIES[emptyKey];
  if (!cfg) return null;

  const toAction = (action: EmptyAction) => ({
    label: t(action.labelKey),
    ...(action.to
      ? { to: action.to }
      : { onClick: action.reset === "day" ? clearDay : clearSecondary }),
  });

  const [primaryAction, secondaryAction] = cfg.actions;

  return (
    <SharedEmptyState
      icon={
        <svg
          viewBox="0 0 28 28"
          width={26}
          height={26}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {cfg.icon}
        </svg>
      }
      title={<Translation i18nKey={cfg.titleKey} components={{ em: <em /> }} />}
      description={t(cfg.subKey)}
      action={primaryAction ? toAction(primaryAction) : undefined}
      secondaryAction={secondaryAction ? toAction(secondaryAction) : undefined}
    />
  );
}
