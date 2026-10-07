import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectoryAdultLoadNote.module.css";

/** Said in place when the member-only 18+ list fails: every other business
 *  stays on screen, and one button asks again. The live region stays mounted
 *  while the tab is open, empty until the failure, so a screen reader hears
 *  the note when its text arrives. */
export function DirectoryAdultLoadNote({
  isShown,
  onRetry,
}: {
  isShown: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={isShown ? s.note : undefined} role="status">
      {isShown && (
        <>
          <FiAlertCircle aria-hidden />
          <span>{t("marketing:directory.online.adultError")}</span>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("marketing:directory.online.adultRetry")}
          </Button>
        </>
      )}
    </div>
  );
}
