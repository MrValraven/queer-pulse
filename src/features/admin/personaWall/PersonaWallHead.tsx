import { useId, type RefObject } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PERSONA_WALL_MAX_PICKS } from "../../subprofiles/api/personaWall.api";
import { StudioAdminShelfMeter } from "../StudioAdminShelfParts";
import css from "./PersonaWallPicks.module.css";

/** The picks section's head: the heading (the focus fallback once the last
 *  row leaves), the "N of 9 picked" count with its slot meter, the phone
 *  note, and Add persona. At nine picks the button stays in place,
 *  aria-disabled, and the reason folds in under it. */
export function PersonaWallHead({
  headingId,
  headingRef,
  count,
  isBusy,
  onAdd,
}: {
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  count: number;
  isBusy: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const fullReasonId = useId();
  const max = PERSONA_WALL_MAX_PICKS;
  const isFull = count >= max;
  return (
    <header className={css.head}>
      <div className={css.headTop}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.heading}
        >
          {t("admin:personaWall.picksHeading")}
        </h2>
        <span className={css.capacity}>
          <span className={css.count}>
            <Translation
              i18nKey="admin:personaWall.count"
              values={{ count, max }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(count)}
                    numericValue={count}
                  />
                ),
              }}
            />
          </span>
          <StudioAdminShelfMeter count={count} max={max} />
        </span>
      </div>
      <p className={css.phoneNote}>{t("admin:personaWall.phoneNote")}</p>
      <div className={css.addRow}>
        <Button
          variant="primary"
          size="sm"
          aria-disabled={isFull || isBusy || undefined}
          aria-describedby={isFull ? fullReasonId : undefined}
          onClick={() => {
            if (!isFull && !isBusy) onAdd();
          }}
        >
          <FiPlus aria-hidden />
          {t("admin:personaWall.addCta")}
        </Button>
      </div>
      <Collapse isOpen={isFull}>
        <p id={fullReasonId} className={css.fullReason}>
          {t("admin:personaWall.full", { max })}
        </p>
      </Collapse>
    </header>
  );
}
