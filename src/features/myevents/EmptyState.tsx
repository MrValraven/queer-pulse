import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { EMPTIES } from "./empties.data";

/** The dashed empty-state card for a given bucket key. */
export function EmptyState({ emptyKey }: { emptyKey: string }) {
  const { t } = useTranslation();
  const { clearDay, clearSecondary } = useMyEvents();
  const cfg = EMPTIES[emptyKey];
  if (!cfg) return null;

  return (
    <div className={sx("empty")}>
      <div className={sx(`empty-icon ${cfg.tone || ""}`)}>
        <svg viewBox="0 0 28 28" aria-hidden>
          {cfg.icon}
        </svg>
      </div>
      <div className={sx("empty-h")}>
        <Translation i18nKey={cfg.titleKey} components={{ em: <em /> }} />
      </div>
      <div className={sx("empty-sub")}>{t(cfg.subKey)}</div>
      <div className={sx("empty-actions")}>
        {cfg.actions.map((a) =>
          a.to ? (
            <Button key={a.labelKey} variant={a.variant} to={a.to}>
              {t(a.labelKey)}
            </Button>
          ) : (
            <Button
              key={a.labelKey}
              variant={a.variant}
              onClick={() =>
                a.reset === "day" ? clearDay() : clearSecondary()
              }
            >
              {t(a.labelKey)}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
