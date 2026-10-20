import { FiCalendar } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { tattooBlockAnchorId } from "./TattooBlock";

interface TattooBookButtonProps {
  /** The editor preview's look-alike: same shape, no scroll. */
  isInert: boolean;
  className?: string;
}

/**
 * "How to book": scrolls the page to the How to book block, smoothly, or at
 * once under reduced motion. Shared by the hero, the sidebar and the phone
 * bar, so all three take the visitor to the same place.
 */
export function TattooBookButton({
  isInert,
  className,
}: TattooBookButtonProps) {
  const { t } = useTranslation();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const content = (
    <>
      <FiCalendar aria-hidden /> {t("subprofiles:tattoo.hero.howToBook")}
    </>
  );
  if (isInert) {
    return (
      <Button
        type="button"
        variant="primary"
        size="md"
        className={className}
        disabled
      >
        {content}
      </Button>
    );
  }
  const scrollToBooking = () => {
    document.getElementById(tattooBlockAnchorId("booking"))?.scrollIntoView({
      behavior: isReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      className={className}
      onClick={scrollToBooking}
    >
      {content}
    </Button>
  );
}
