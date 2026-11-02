import { FiCalendar } from "react-icons/fi";
import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { addEventMonthPath } from "../gatheringPaths";
import { useCanAddEventMonth } from "./useCanAddEventMonth";

interface AddEventMonthButtonProps {
  /** Slug of the event the month starts from; opens the page with that event preselected. */
  fromSlug?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Entry link to "Add a month of events". Renders nothing for a member without access. */
export function AddEventMonthButton({
  fromSlug,
  variant = "ghost",
  size,
  className,
}: AddEventMonthButtonProps) {
  const { t } = useTranslation();
  const canAddEventMonth = useCanAddEventMonth();
  if (!canAddEventMonth) return null;
  return (
    <Button
      to={addEventMonthPath(fromSlug)}
      variant={variant}
      size={size}
      className={className}
    >
      <FiCalendar aria-hidden />{" "}
      {fromSlug
        ? t("gatherings:addMonth.entry.fromEventCta")
        : t("gatherings:addMonth.entry.cta")}
    </Button>
  );
}
