import { useEffect, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryReviewForm } from "./DirectoryReviewForm";
import s from "./DirectorySpacePage.module.css";

/** What the panel hands focus to the moment it opens: the composer's checked
 *  star when a draft already has a rating (the roving tabindex's own tab
 *  stop, excluded from this selector's plain `button:not([disabled])` clause
 *  so a reopen cannot land on star one), else the first star, else the
 *  sign-in link. */
const FIRST_FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([tabindex="-1"]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Props {
  slug: string;
}

/**
 * The collapsible "Leave a review" affordance rendered by
 * `DirectoryReviewsSection`: a button that reveals `DirectoryReviewForm` in
 * place, so the rating summary and the reviews people came to read lead the
 * section, with the form one tap away. The section omits this component
 * for a moderation preview.
 *
 * The panel stays mounted while collapsed, hidden purely via the `hidden`
 * attribute, so a draft in progress in the composer survives a collapse.
 * Owns the focus handoff in both directions: opening moves focus to
 * the rating picker's tab stop (or the sign-in link), and Cancel, Escape or
 * a successful post move it back to this button.
 */
export function DirectoryReviewFormDisclosure({ slug }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isPreviouslyOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      panelRef.current
        ?.querySelector<HTMLElement>(FIRST_FOCUSABLE_SELECTOR)
        ?.focus();
    } else if (isPreviouslyOpenRef.current) {
      // Guarded on a prior open, so this only fires on a genuine close; the
      // initial collapsed render leaves focus wherever the page put it.
      toggleButtonRef.current?.focus();
    }
    isPreviouslyOpenRef.current = isOpen;
  }, [isOpen]);

  const close = () => setIsOpen(false);

  // Escape closes the panel from anywhere inside it. A plain onKeyDown on the
  // wrapping div would make it a static element with an interaction handler,
  // so this listens on the panel node itself instead, only while open.
  useEffect(() => {
    if (!isOpen) return;
    const panelNode = panelRef.current;
    if (!panelNode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      close();
    };
    panelNode.addEventListener("keydown", handleKeyDown);
    return () => panelNode.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* No aria-expanded/aria-controls here: the toggle unmounts for the
          whole time the panel is open (the form has its own Cancel), so
          focus moves into the revealed form on open and back to this button
          on close. */}
      {!isOpen && (
        <div className={s.reviewToggle}>
          <Button
            ref={toggleButtonRef}
            variant="ghost"
            onClick={() => setIsOpen(true)}
          >
            <FiEdit3 aria-hidden />
            {t("marketing:directory.detail.review.leaveCta")}
          </Button>
        </div>
      )}
      <div ref={panelRef} hidden={!isOpen}>
        <DirectoryReviewForm slug={slug} onCancel={close} onPosted={close} />
      </div>
    </>
  );
}
