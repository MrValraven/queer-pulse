import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Asks whether to drop one date or leave a whole recurring series. */
export function SeriesScopeModal() {
  const { t } = useTranslation();
  const { scope, scopeChoice, closeScope } = useMyEvents();
  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>
          {t("myevents:seriesModal.eyebrow")}
        </div>
        <h2 className={sx("modal-title")}>
          <Translation
            i18nKey="myevents:seriesModal.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={sx("modal-evname")}>{scope.title}</p>
      </div>
      <div className={sx("modal-body")}>
        <button
          type="button"
          className={sx("set-link-row")}
          onClick={() => scopeChoice("one")}
        >
          <span className={sx("slr-t")}>
            {t("myevents:seriesModal.justThisDate")}
            <span>{t("myevents:seriesModal.justThisDateSub")}</span>
          </span>
          <span className={sx("slr-arrow")}>→</span>
        </button>
        <button
          type="button"
          className={sx("set-link-row")}
          onClick={() => scopeChoice("all")}
        >
          <span className={sx("slr-t")}>
            {t("myevents:seriesModal.leaveWholeSeries")}
            <span>{t("myevents:seriesModal.leaveWholeSeriesSub")}</span>
          </span>
          <span className={sx("slr-arrow")}>→</span>
        </button>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")} />
        <Button variant="ghost" onClick={closeScope}>
          {t("myevents:seriesModal.neverMindCta")}
        </Button>
      </div>
    </>
  );
}
