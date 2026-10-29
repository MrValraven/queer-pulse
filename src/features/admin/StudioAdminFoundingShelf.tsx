import { useId } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSetFoundingShelf } from "./api/useStudioAdminLandingMutations";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import css from "./StudioAdminFounding.module.css";

/** The launch shelf switch with its help line. It sends the new setting and
 *  hands the status line to `onAnnounce` for the tab's status region. */
export function StudioAdminFoundingShelf({
  isVisible,
  onAnnounce,
}: {
  isVisible: boolean;
  onAnnounce: (message: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const toggleId = useId();
  const helpId = useId();
  const setShelf = useSetFoundingShelf();

  function changeShelf(isFoundingShelfVisible: boolean) {
    if (setShelf.isPending) return;
    setShelf.mutate(
      { isFoundingShelfVisible },
      {
        onSuccess: () =>
          onAnnounce(
            t(
              isFoundingShelfVisible
                ? "admin:studioAdmin.founding.shelfOn"
                : "admin:studioAdmin.founding.shelfOff",
            ),
          ),
        onError: (cause) =>
          showToast(t(studioAdminSaveErrorKeyOf(cause)), "error"),
      },
    );
  }

  return (
    <div className={css.shelfSwitch}>
      <div className={css.shelfText}>
        <label htmlFor={toggleId} className={css.shelfLabel}>
          {t("admin:studioAdmin.founding.shelfLabel")}
        </label>
        <span id={helpId} className={css.meta}>
          {t("admin:studioAdmin.founding.shelfHelp")}
        </span>
      </div>
      <Toggle
        id={toggleId}
        aria-describedby={helpId}
        label={t("admin:studioAdmin.founding.shelfLabel")}
        checked={isVisible}
        onChange={changeShelf}
      />
    </div>
  );
}
