import { useEffect, useRef, useState } from "react";
import { FiRepeat } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminDirectoryPartnerSearchResultDTO } from "../marketing/api/directoryPartners.api";
import { AdminDirectoryPartnerThumb } from "./AdminDirectoryPartnerThumb";
import pickCss from "./StudioAdminPickDialog.module.css";
import css from "./AdminDirectoryPartners.module.css";

/** The chosen business as a compact card with "Choose another business".
 *  It folds in where the results folded away and keeps the last choice
 *  drawn while it folds out. Focus moves to its button, since the result
 *  that held focus leaves with the results. */
export function AdminDirectoryPartnerChosenCard({
  chosen,
  onChange,
}: {
  chosen: AdminDirectoryPartnerSearchResultDTO | null;
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const [lastChosen, setLastChosen] = useState(chosen);
  if (chosen !== null && chosen !== lastChosen) setLastChosen(chosen);
  const shown = chosen ?? lastChosen;
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (chosen) changeButtonRef.current?.focus();
  }, [chosen]);
  return (
    <Collapse isOpen={chosen !== null}>
      {shown ? (
        <div className={pickCss.chosenCard}>
          <p className={pickCss.chosenEyebrow}>
            {t("admin:directoryPartners.addDialog.chosenHeading")}
          </p>
          <div className={pickCss.chosenRow}>
            <span className={css.summary}>
              <AdminDirectoryPartnerThumb
                coverImage={null}
                tint={shown.tint}
                initials={shown.av}
              />
              <span className={css.resultText}>
                <span className={css.name}>{shown.name}</span>
                {shown.hood ? (
                  <span className={css.hood}>{shown.hood}</span>
                ) : null}
              </span>
            </span>
            <Button
              ref={changeButtonRef}
              variant="ghost"
              size="sm"
              className={pickCss.chosenChange}
              onClick={onChange}
            >
              <FiRepeat aria-hidden />
              {t("admin:directoryPartners.addDialog.changeCta")}
            </Button>
          </div>
        </div>
      ) : null}
    </Collapse>
  );
}
