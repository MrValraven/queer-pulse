import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import s from "./StudioRightsPage.module.css";

interface StudioTakedownModalProps {
  title: string;
  meta: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirm-takedown dialog on the shared `ConfirmDialog`: focus opens on the
 * safe action (Keep it up), never on the destructive one, and Escape, the
 * scrim and Cancel all keep the release. It owns its presence, so the dialog
 * plays its exit before the page hears the outcome: `onConfirm` after a
 * confirm, `onClose` after any other dismissal.
 */
export function StudioTakedownModal({
  title,
  meta,
  onConfirm,
  onClose,
}: StudioTakedownModalProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const outcomeRef = useRef<"confirm" | "close">("close");

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (outcomeRef.current === "confirm") onConfirm();
        else onClose();
      }}
    >
      {isOpen && (
        <ConfirmDialog
          open
          tone="destructive"
          initialFocus="cancel"
          title={
            <Translation
              i18nKey="studio:rights.modal.title"
              values={{ title }}
              components={{ em: <em /> }}
            />
          }
          confirmLabel={
            <>
              {t("studio:rights.modal.confirmCta")} <FiArrowRight aria-hidden />
            </>
          }
          cancelLabel={t("studio:rights.modal.cancelCta")}
          onConfirm={() => {
            outcomeRef.current = "confirm";
            setIsOpen(false);
          }}
          onClose={() => {
            outcomeRef.current = "close";
            setIsOpen(false);
          }}
        >
          <div className={s.eb}>{t("studio:rights.modal.eyebrow")}</div>
          <div className={s.modalMeta}>{meta}</div>
          <p className={s.modalBody}>
            <Translation
              i18nKey="studio:rights.modal.body"
              components={{ em: <em /> }}
            />
          </p>
          <div className={s.keep}>
            <p>
              <Translation
                i18nKey="studio:rights.modal.keepEarned"
                components={{ em: <em /> }}
              />
            </p>
          </div>
        </ConfirmDialog>
      )}
    </AnimatePresence>
  );
}
