import { useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiRepeat } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import css from "./StudioAdminPickDialog.module.css";
import { StudioAdminReleaseSummary } from "./StudioAdminReleaseSummary";

/** The chosen release as a compact card, with a button that clears the
 *  choice. It folds in where the results folded away, and the last release
 *  stays drawn while it folds out. A hidden status line announces each
 *  choice, and focus moves to "Choose another release", since the row that
 *  held it leaves with the results. */
export function StudioAdminChosenRelease({
  chosen,
  replacedTitle,
  onChange,
}: {
  chosen: AdminStudioReleaseCardDTO | null;
  /** The featured release this choice replaces, for the line under the card. */
  replacedTitle: string | null;
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const [lastChosen, setLastChosen] = useState(chosen);
  if (chosen !== null && chosen !== lastChosen) setLastChosen(chosen);
  const shown = chosen ?? lastChosen;
  const [lastReplacedTitle, setLastReplacedTitle] = useState(replacedTitle);
  if (replacedTitle !== null && replacedTitle !== lastReplacedTitle)
    setLastReplacedTitle(replacedTitle);
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (chosen) changeButtonRef.current?.focus();
  }, [chosen]);
  return (
    <>
      <p className="visuallyHidden" role="status">
        {chosen
          ? t("admin:studioAdmin.pickDialog.chosen", { title: chosen.title })
          : null}
      </p>
      <Collapse isOpen={chosen !== null}>
        {shown ? (
          <div className={css.chosenCard}>
            <p className={css.chosenEyebrow}>
              {t("admin:studioAdmin.pickDialog.chosenHeading")}
            </p>
            <div className={css.chosenRow}>
              <StudioAdminReleaseSummary release={shown} size="md" />
              <Button
                ref={changeButtonRef}
                variant="ghost"
                size="sm"
                className={css.chosenChange}
                onClick={onChange}
              >
                <FiRepeat aria-hidden />
                {t("admin:studioAdmin.pickDialog.changeCta")}
              </Button>
            </div>
          </div>
        ) : null}
      </Collapse>
      <Collapse isOpen={replacedTitle !== null}>
        <p className={css.replaceNotice}>
          <FiRefreshCw className={css.replaceNoticeIcon} aria-hidden />
          <span>
            {t("admin:studioAdmin.pickDialog.replacesFeatured", {
              title: replacedTitle ?? lastReplacedTitle ?? "",
            })}
          </span>
        </p>
      </Collapse>
    </>
  );
}
