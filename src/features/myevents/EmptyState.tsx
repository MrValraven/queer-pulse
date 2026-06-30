import { Button } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { EMPTIES } from "./empties.data";

/** The dashed empty-state card for a given bucket key. */
export function EmptyState({ emptyKey }: { emptyKey: string }) {
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
      <div className={sx("empty-h")}>{cfg.title}</div>
      <div className={sx("empty-sub")}>{cfg.sub}</div>
      <div className={sx("empty-actions")}>
        {cfg.actions.map((a) =>
          a.to ? (
            <Button key={a.label} variant={a.variant} to={a.to}>
              {a.label}
            </Button>
          ) : (
            <Button
              key={a.label}
              variant={a.variant}
              onClick={() =>
                a.reset === "day" ? clearDay() : clearSecondary()
              }
            >
              {a.label}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
