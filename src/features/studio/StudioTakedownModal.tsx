import { FiArrowRight } from "react-icons/fi";
import { useDismiss, useScrimDismiss } from "../../shared/components/ui";
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
 * Confirm-takedown dialog. Self-contained: only mounted while open, so it
 * locks scroll unconditionally. Closes on backdrop click and Esc; confirming
 * hands control back to the page which flips the release into its removal
 * window.
 */
export function StudioTakedownModal({
  title,
  meta,
  onConfirm,
  onClose,
}: StudioTakedownModalProps) {
  const { t } = useTranslation();
  // Shared dialog behaviour: focus trap, initial focus, focus restore, scroll
  // lock, and modal-stack-aware Escape. This confirms a takedown, so a
  // keyboard user must not be able to Tab out to the page behind it.
  const dialogRef = useDismiss(onClose);
  // Requires the pointer to have gone DOWN on the scrim, so a text-selection
  // drag that ends outside the dialog no longer dismisses it.
  const scrimProps = useScrimDismiss(onClose);

  return (
    <div className={s.modalBg} role="presentation" {...scrimProps}>
      <div
        ref={dialogRef}
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t("studio:rights.modal.confirmAria", { title })}
      >
        <div className={s.eb}>{t("studio:rights.modal.eyebrow")}</div>
        <h3 className={s.modalTitle}>
          <Translation
            i18nKey="studio:rights.modal.title"
            values={{ title }}
            components={{ em: <em /> }}
          />
        </h3>
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
        <div className={s.modalActions}>
          <button
            type="button"
            className={`${s.bt} ${s.btConfirm}`}
            onClick={onConfirm}
          >
            {t("studio:rights.modal.confirmCta")} <FiArrowRight aria-hidden />
          </button>
          <button type="button" className={s.bt} onClick={onClose}>
            {t("studio:rights.modal.cancelCta")}
          </button>
        </div>
      </div>
    </div>
  );
}
