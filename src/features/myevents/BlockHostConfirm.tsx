import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Confirm step before blocking a host — destructive, so never one-tap. */
export function BlockHostConfirm() {
  const { t } = useTranslation();
  const { block, confirmBlock, closeBlock } = useMyEvents();

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>
          {t("myevents:blockModal.eyebrow")}
        </div>
        <h2 className={sx("modal-title")}>
          {block.host ? (
            <Translation
              i18nKey="myevents:blockModal.titleNamed"
              components={{ em: <em /> }}
              values={{ host: block.host }}
            />
          ) : (
            <Translation
              i18nKey="myevents:blockModal.titleFallback"
              components={{ em: <em /> }}
            />
          )}
        </h2>
      </div>
      <div className={sx("modal-body")}>
        <p className={sx("modal-evname")}>
          {block.host
            ? t("myevents:blockModal.bodyNamed", { host: block.host })
            : t("myevents:blockModal.bodyFallback")}
        </p>
      </div>
      <div className={sx("modal-foot")}>
        <Button variant="ghost" onClick={closeBlock}>
          {t("myevents:blockModal.cancelCta")}
        </Button>
        <Button variant="danger" onClick={confirmBlock}>
          {t("myevents:blockModal.confirmCta")}
        </Button>
      </div>
    </>
  );
}
