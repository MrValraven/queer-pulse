import { useState, type ReactNode } from "react";
import { AdultsOnlyModal } from "./AdultsOnlyModal";
import s from "./AdultsOnlyLink.module.css";

/**
 * Inline "here's why" trigger inside the 18+ attestation helper that opens the
 * adults-only explainer in a bottom-up sheet instead of navigating away to the
 * Terms — so someone mid-signup or mid-onboarding can read why the community is
 * 18+ without abandoning the form. Drop it into a
 * `<Translation components={{ eligibility: <AdultsOnlyLink /> }}>` run; the
 * cloned inner text becomes its children.
 *
 * It's a `<span role="button">`, not an `<a>`/`<Link>`, because it sits inside a
 * paragraph alongside other inline controls — `preventDefault` +
 * `stopPropagation` keep the click from bubbling, and `onKeyDown` gives it
 * Enter/Space activation to match a button.
 */
export function AdultsOnlyLink({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
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
      {open && <AdultsOnlyModal onClose={() => setOpen(false)} />}
    </>
  );
}
