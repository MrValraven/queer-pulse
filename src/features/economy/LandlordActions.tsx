import { FiFlag } from "react-icons/fi";
import { Button, SaveButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./LandlordPage.module.css";

interface LandlordActionsProps {
  landlordName: string;
  saved: boolean;
  onToggleSave: () => void;
  onReport: () => void;
}

/**
 * Secondary save/report controls for the landlord detail hero. The detail
 * page isn't a card-in-Link (unlike the board's LandlordCard), so real
 * <Button> elements are fine here — no span[role=button] workaround needed.
 */
export function LandlordActions({
  landlordName,
  saved,
  onToggleSave,
  onReport,
}: LandlordActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={s.heroSecondary}>
      <SaveButton
        saved={saved}
        onToggle={onToggleSave}
        label={t(
          saved ? "economy:landlordPage.saved" : "economy:landlordPage.save",
        )}
      />
      <Button
        variant="ghost"
        onClick={onReport}
        aria-label={t("economy:landlordPage.reportAriaLabel", {
          name: landlordName,
        })}
      >
        <FiFlag aria-hidden />
        {t("economy:landlordPage.report")}
      </Button>
    </div>
  );
}
