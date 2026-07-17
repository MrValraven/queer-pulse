import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { yearInsights } from "./myEvents.helpers";

const BROWSE = linkToPath("QueerPulse Gathering.html");

/** "Your year so far" plum stats panel beneath the calendar. */
export function InsightsCard() {
  const { t } = useTranslation();
  const { events } = useMyEvents();
  const { attended, hosted, streak, topCircle } = yearInsights(events);

  // No gatherings yet this year → an oriented empty state, never a fake tally.
  if (attended === 0) {
    return (
      <div className={sx("insights")}>
        <div className={sx("ins-eyebrow")}>
          {t("myevents:insights.eyebrow")}
        </div>
        <div className={sx("ins-stat")}>
          <Translation
            i18nKey="myevents:insights.emptyStat"
            components={{ em: <em /> }}
          />
        </div>
        <div className={sx("ins-sub")}>{t("myevents:insights.emptySub")}</div>
        <div className={sx("ins-empty-cta")}>
          <Button variant="ghost-dark" to={BROWSE}>
            {t("myevents:insights.emptyCta")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={sx("insights")}>
      <div className={sx("ins-eyebrow")}>{t("myevents:insights.eyebrow")}</div>
      <div className={sx("ins-stat")}>
        <Translation
          i18nKey="myevents:insights.stat"
          components={{ em: <em /> }}
          values={{ count: attended }}
        />
      </div>
      <div className={sx("ins-sub")}>{t("myevents:insights.sub")}</div>
      <div className={sx("ins-row")}>
        <div className={sx("ins-item")}>
          <div className={sx("ins-n")}>{streak}</div>
          <div className={sx("ins-l")}>
            {t("myevents:insights.streak", { count: streak })}
          </div>
        </div>
        {topCircle && (
          <div className={sx("ins-item")}>
            <div className={sx("ins-n")}>{topCircle}</div>
            <div className={sx("ins-l")}>
              {t("myevents:insights.topCircle")}
            </div>
          </div>
        )}
        <div className={sx("ins-item")}>
          <div className={sx("ins-n")}>{hosted}</div>
          <div className={sx("ins-l")}>{t("myevents:insights.hosted")}</div>
        </div>
      </div>
    </div>
  );
}
