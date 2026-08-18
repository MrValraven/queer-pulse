import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LegalSection } from "./LegalDoc";
import docStyles from "./LegalDoc.module.css";
import styles from "./LegalDocModal.module.css";

interface LegalDocModalProps {
  eyebrow: string;
  title: ReactNode;
  plain?: { title: string; text: string };
  toc?: { id: string; label: string }[];
  sections: LegalSection[];
  /** Full standalone page this doc also lives at, linked at the foot of the modal. */
  fullPageTo: string;
  /** Section id to scroll to as soon as the modal opens (e.g. a specific clause). */
  initialAnchor?: string;
  onClose: () => void;
}

/**
 * The same Terms/Privacy content as the standalone marketing pages
 * (`TermsPage`/`PrivacyPage`), read in place over whatever flow linked to it —
 * an invite/onboarding step never has to lose its place to read the fine
 * print. Reuses `LegalDoc.module.css` so the prose matches the full page.
 */
export function LegalDocModal({
  eyebrow,
  title,
  plain,
  toc,
  sections,
  fullPageTo,
  initialAnchor,
  onClose,
}: LegalDocModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!initialAnchor) return;
    // Defer to the next frame so the dialog has mounted and laid out before
    // scrolling one of its sections into view.
    const raf = requestAnimationFrame(() => {
      document
        .getElementById(initialAnchor)
        ?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [initialAnchor]);

  function scrollToSection(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <Modal wide eyebrow={eyebrow} title={title} onClose={onClose}>
      {plain && (
        <div className={docStyles.plain}>
          <div className={docStyles.plainTitle}>{plain.title}</div>
          <div className={docStyles.plainText}>{plain.text}</div>
        </div>
      )}

      {toc && toc.length > 0 && (
        <div className={docStyles.toc}>
          <div className={docStyles.tocTitle}>
            {t("marketing:legal.toc.title")}
          </div>
          <div className={docStyles.tocLinks}>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div className={docStyles.section} id={section.id} key={section.id}>
          <div className={docStyles.sTitle}>{section.title}</div>
          <div className={docStyles.sBody}>{section.body}</div>
        </div>
      ))}

      <p className={styles.fullPageLink}>
        <Link to={fullPageTo} onClick={onClose}>
          {t("marketing:legal.viewFullPage")}
        </Link>
      </p>
    </Modal>
  );
}
