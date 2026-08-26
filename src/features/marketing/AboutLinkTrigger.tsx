import { useState, type ReactNode } from "react";
import { AboutLinkModal } from "./AboutLinkModal";
import type { AboutLinkTopicId } from "./aboutLinks.data";
import s from "./AboutLinkTrigger.module.css";

interface AboutLinkTriggerProps {
  topic: AboutLinkTopicId;
  /** The About page's own link class, so the trigger keeps the link's look. */
  className?: string;
  children: ReactNode;
}

/**
 * The inline "read the guidelines"-style trigger on the About page. A real
 * `<button>` carrying the page's link styling, because it opens a dialog rather
 * than navigating; the reset in the module strips the UA button chrome so it
 * still reads as a link inside a sentence.
 */
export function AboutLinkTrigger({
  topic,
  className,
  children,
}: AboutLinkTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={[s.trigger, className].filter(Boolean).join(" ")}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>
      {isOpen && (
        <AboutLinkModal topic={topic} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
