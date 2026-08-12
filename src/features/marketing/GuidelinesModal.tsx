import { useCallback } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, ModalSheet } from "../../shared/components/ui";
import { GuidelinesContent } from "./GuidelinesContent";
import s from "./GuidelinesModal.module.css";

/**
 * The Community Guidelines in a bottom-up sheet — so a signup or onboarding
 * reader can skim the norms without leaving the form and losing what they've
 * typed. `ModalSheet` rises from the bottom on mobile and centers on desktop,
 * scroll-locks the page behind, and traps focus; its own body scrolls, so the
 * long clause list stays reachable. It carries no built-in title, so we supply
 * the guidelines' own hero eyebrow/title/sub here above the shared content.
 */
export function GuidelinesModal({
  onClose,
  onRead,
}: {
  onClose: () => void;
  onRead?: () => void;
}) {
  const { t } = useTranslation();

  // The explicit "I've read it — done" button IS the read confirmation: one
  // deliberate click marks the guidelines read (unlocking the consent checkbox
  // in the host form via `onRead`) and closes the sheet. A passive scroll
  // sentinel proved unreliable — it could miss the end (leaving the checkbox
  // permanently locked) or fire on open (unlocking it with no deliberate
  // action), so the gate hangs on this click instead.
  const handleDone = useCallback(() => {
    onRead?.();
    onClose();
  }, [onRead, onClose]);

  return (
    <ModalSheet
      onClose={onClose}
      wide
      ariaLabel={t("marketing:guidelines.meta.title")}
    >
      <div className={s.head}>
        <div className={s.eyebrow}>{t("marketing:guidelines.hero.eyebrow")}</div>
        <h2 className={s.title}>
          <Translation
            i18nKey="marketing:guidelines.hero.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.sub}>{t("marketing:guidelines.hero.sub")}</p>
      </div>
      <GuidelinesContent />
      <div className={s.footer}>
        <Button variant="primary" onClick={handleDone}>
          {t("marketing:guidelines.modalDone")}
        </Button>
      </div>
    </ModalSheet>
  );
}
