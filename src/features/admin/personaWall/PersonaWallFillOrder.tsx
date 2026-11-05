import { useEffect, useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Collapse, RadioCardGroup } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PersonaWallFillOrder as FillOrder } from "../../subprofiles/api/personaWall.api";
import {
  usePersonaWallIsWriting,
  useSetPersonaWallFillOrder,
} from "../api/useAdminPersonaWallMutations";
import {
  PERSONA_WALL_ERROR_VALUES,
  personaWallErrorKeyOf,
} from "./personaWallAdmin.model";
import { PERSONA_WALL_FILL_ORDER_OPTIONS } from "./personaWallAdmin.data";
import styles from "./PersonaWallPanels.module.css";

/** How long the "saved" line stays after a save before it folds away. */
const SAVED_LINE_VISIBLE_MS = 4000;

/**
 * The wall's fill order: a radio group over the four orders that top the
 * wall up past the admin's picks. A choice shows at once and saves; a
 * refusal rolls the check back and the line under the group names its
 * cause. A saved line folds away a few seconds after it appears; a hidden
 * status region, always mounted, announces the save. A second press while
 * any wall write is in flight is ignored.
 */
export function PersonaWallFillOrder({ fillOrder }: { fillOrder: FillOrder }) {
  const { t } = useTranslation();
  const headingId = useId();
  const introId = useId();
  const setFillOrder = useSetPersonaWallFillOrder();
  const isWriting = usePersonaWallIsWriting();
  const hasSaved = setFillOrder.isSuccess;
  const hasFailed = setFillOrder.isError;
  const resetSetFillOrder = setFillOrder.reset;

  useEffect(() => {
    if (!hasSaved) return;
    const timerId = window.setTimeout(resetSetFillOrder, SAVED_LINE_VISIBLE_MS);
    return () => window.clearTimeout(timerId);
  }, [hasSaved, resetSetFillOrder]);

  const chooseFillOrder = (nextFillOrder: FillOrder) => {
    if (nextFillOrder === fillOrder || isWriting) return;
    setFillOrder.mutate({ fillOrder: nextFillOrder });
  };

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div>
        <h2 id={headingId} className={styles.heading}>
          {t("admin:personaWall.fill.heading")}
        </h2>
        <p id={introId} className={styles.intro}>
          {t("admin:personaWall.fill.intro")}
        </p>
      </div>
      <RadioCardGroup
        value={fillOrder}
        onChange={chooseFillOrder}
        ariaLabelledBy={headingId}
        ariaLabel={t("admin:personaWall.fill.heading")}
        ariaDescribedBy={introId}
        className={styles.choices}
        optionClassName={styles.choice}
        checkedClassName={styles.choiceChecked}
        options={PERSONA_WALL_FILL_ORDER_OPTIONS.map((option) => ({
          id: option.id,
          render: (
            <>
              <span className={styles.choiceBody}>
                <span className={styles.choiceTitle}>{t(option.labelKey)}</span>
                <span className={styles.choiceText}>
                  {t(option.descriptionKey)}
                </span>
              </span>
              <FiCheck className={styles.choiceCheck} aria-hidden />
            </>
          ),
        }))}
      />
      <p className="visuallyHidden" role="status">
        {hasSaved ? t("admin:personaWall.fill.saved") : ""}
      </p>
      <Collapse isOpen={hasSaved}>
        <p className={styles.saved} aria-hidden>
          {t("admin:personaWall.fill.saved")}
        </p>
      </Collapse>
      <Collapse isOpen={hasFailed}>
        <p className={styles.failure} role="alert">
          {t(
            personaWallErrorKeyOf(setFillOrder.error),
            PERSONA_WALL_ERROR_VALUES,
          )}
        </p>
      </Collapse>
    </section>
  );
}
