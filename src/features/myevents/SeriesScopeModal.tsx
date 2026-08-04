import { FiArrowRight } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Asks whether to drop one date or leave a whole recurring series. */
export function SeriesScopeModal() {
  const { t } = useTranslation();
  const { scope, scopeChoice, closeScope } = useMyEvents();
  return (
    <Modal
      onClose={closeScope}
      eyebrow={t("myevents:seriesModal.eyebrow")}
      title={
        <Translation
          i18nKey="myevents:seriesModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={scope.title}
      footer={
        <>
          <div className={sx("modal-privacy")} />
          <Button variant="ghost" onClick={closeScope}>
            {t("myevents:seriesModal.neverMindCta")}
          </Button>
        </>
      }
    >
      <button
        type="button"
        className={sx("set-link-row")}
        onClick={() => scopeChoice("one")}
      >
        <span className={sx("slr-t")}>
          {t("myevents:seriesModal.justThisDate")}
          <span>{t("myevents:seriesModal.justThisDateSub")}</span>
        </span>
        <span className={sx("slr-arrow")} aria-hidden>
          <FiArrowRight />
        </span>
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
        <span className={sx("slr-arrow")} aria-hidden>
          <FiArrowRight />
        </span>
      </button>
    </Modal>
  );
}
