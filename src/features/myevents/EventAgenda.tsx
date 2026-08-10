import { useMemo } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  FadeIn,
  EmptyState as SharedEmptyState,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { buildAgenda } from "./myEvents.agenda";
import { EventCard } from "./EventCard";
import { EmptyState } from "./EmptyState";

function AgendaSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className={sx("sk-wrap")}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className={sx("sk-card")}>
          <div className={sx("sk-tile qp-skeleton")} />
          <div className={sx("sk-lines")}>
            <div className={sx("sk-line tall qp-skeleton")} />
            <div className={sx("sk-line qp-skeleton")} />
            <div className={sx("sk-line short qp-skeleton")} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The left-hand agenda column: grouped event cards, empty states, discovery. */
export function EventAgenda() {
  const { t } = useTranslation();
  const c = useMyEvents();
  const result = useMemo(
    () =>
      buildAgenda(
        c.events,
        {
          pill: c.pill,
          selectedDate: c.selectedDate,
          searchTerm: c.searchTerm,
          activeFilters: c.activeFilters,
          sortBy: c.sortBy,
          viewM: c.viewM,
          viewY: c.viewY,
          pastShown: c.pastShown,
          hasSecondary: c.hasSecondary,
        },
        t,
      ),
    [
      c.events,
      c.pill,
      c.selectedDate,
      c.searchTerm,
      c.activeFilters,
      c.sortBy,
      c.viewM,
      c.viewY,
      c.pastShown,
      c.hasSecondary,
      t,
    ],
  );

  if (c.loading) {
    return (
      <div className={sx("agenda")}>
        <AgendaSkeleton n={c.pill === "saved" ? 3 : 4} />
      </div>
    );
  }

  // A failed live fetch must not masquerade as an empty calendar — surface a
  // distinct error state with a retry, never a false "nothing on the calendar".
  if (c.hasError) {
    return (
      <div className={sx("agenda")}>
        <SharedEmptyState
          icon={<FiAlertTriangle aria-hidden />}
          title={
            <Translation
              i18nKey="myevents:agenda.error.title"
              components={{ em: <em /> }}
            />
          }
          description={t("myevents:agenda.error.description")}
          action={{
            label: t("myevents:agenda.error.retry"),
            onClick: c.retry,
          }}
        />
      </div>
    );
  }

  if (result.emptyKey) {
    return (
      <div className={sx("agenda")}>
        <EmptyState emptyKey={result.emptyKey} />
      </div>
    );
  }

  let idx = 0;
  return (
    <div className={sx("agenda")}>
      {result.groups.map((g) => (
        <div key={g.label ?? "all"}>
          {g.label && <div className={sx("grp-label")}>{g.label}</div>}
          <div className={sx("ev-list")}>
            {g.events.map((ev) => (
              <FadeIn key={ev.id} delay={Math.min(idx++, 8) * 45}>
                <EventCard ev={ev} />
              </FadeIn>
            ))}
          </div>
        </div>
      ))}
      {result.loadMoreCount > 0 && (
        <div className={sx("load-more")}>
          <Button variant="ghost" onClick={c.loadMorePast}>
            {t("myevents:agenda.showMore", { count: result.loadMoreCount })}
          </Button>
        </div>
      )}
    </div>
  );
}
