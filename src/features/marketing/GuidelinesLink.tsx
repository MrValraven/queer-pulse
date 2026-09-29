import { useState, type ReactNode } from "react";
import { GuidelinesModal } from "./GuidelinesModal";
import s from "./GuidelinesLink.module.css";

/**
 * Inline "community guidelines" trigger that opens the guidelines in a bottom-up
 * sheet instead of navigating away — so someone mid-signup or mid-onboarding can
 * read the norms without abandoning the form. Drop it straight into a
 * `<Translation components={{ guidelines: <GuidelinesLink /> }}>` run; the
 * cloned inner text becomes its children.
 *
 * It's a `<span role="button">`, not an `<a>`/`<Link>`, because it lives inside
 * a checkbox `<label>` — `preventDefault` + `stopPropagation` stop the click
 * from toggling the box (the repo's rule against nesting a real button in a
 * label/link). `onKeyDown` gives it Enter/Space activation to match a button.
 *
 * Pass `isOpen` + `onOpenChange` to control the sheet from the host, so a
 * locked consent checkbox can open the same sheet its link does.
 */
export function GuidelinesLink({
  children,
  onRead,
  isOpen,
  onOpenChange,
}: {
  children?: ReactNode;
  onRead?: () => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  const [isOpenLocally, setIsOpenLocally] = useState(false);
  const open = isOpen ?? isOpenLocally;
  function setOpen(nextIsOpen: boolean) {
    setIsOpenLocally(nextIsOpen);
    onOpenChange?.(nextIsOpen);
  }
  return (
    <>
      <span
        role="button"
        tabIndex={0}
        className={s.trigger}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }
        }}
      >
        {children}
      </span>
      {open && (
        <GuidelinesModal onClose={() => setOpen(false)} onRead={onRead} />
      )}
    </>
  );
}
