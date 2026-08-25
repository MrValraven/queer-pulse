import { useCallback, useEffect, useRef, useState } from "react";
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

  // The confirm button is a two-part gate. First the reader has to actually
  // reach the bottom of the clauses: a sentinel at the end of the content
  // flips `reachedEnd` once it scrolls into the sheet's viewport, which enables
  // the button. Then one deliberate click on "I've read it — done" is the
  // confirmation that marks the guidelines read (ticking the consent checkbox
  // in the host form via `onRead`) and closes the sheet. The click stays the
  // confirming action, so scrolling alone never silently unlocks anything; the
  // sentinel only decides *when the button becomes clickable*. If the clauses
  // are short enough not to scroll, the sentinel is visible on open and the
  // button starts enabled, so the gate can never strand a reader.
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  useEffect(() => {
    const sentinel = endSentinelRef.current;
    if (!sentinel) return;
    // Observe against the scrolling sheet itself (the dialog element), so the
    // intersection is clipped to what's actually visible inside the sheet.
    const scrollRoot = sentinel.closest('[role="dialog"]');
    const observer = new IntersectionObserver(
      (entries) => {
        // Latch on: once they've reached the end, scrolling back up must not
        // relock the button.
        if (entries.some((entry) => entry.isIntersecting)) setReachedEnd(true);
      },
      { root: scrollRoot, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleDone = useCallback(() => {
    if (!reachedEnd) return;
    onRead?.();
    onClose();
  }, [reachedEnd, onRead, onClose]);

  return (
    <ModalSheet
      onClose={onClose}
      wide
      ariaLabel={t("marketing:guidelines.meta.title")}
    >
      <div className={s.head}>
        <div className={s.eyebrow}>
          {t("marketing:guidelines.hero.eyebrow")}
        </div>
        <h2 className={s.title}>
          <Translation
            i18nKey="marketing:guidelines.hero.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.sub}>{t("marketing:guidelines.hero.sub")}</p>
      </div>
      <GuidelinesContent />
      <div ref={endSentinelRef} className={s.endSentinel} aria-hidden />
      <div className={s.footer}>
        {!reachedEnd && (
          <p className={s.footerHint}>
            {t("marketing:guidelines.modalScrollHint")}
          </p>
        )}
        <Button variant="primary" onClick={handleDone} disabled={!reachedEnd}>
          {t("marketing:guidelines.modalDone")}
        </Button>
      </div>
    </ModalSheet>
  );
}
