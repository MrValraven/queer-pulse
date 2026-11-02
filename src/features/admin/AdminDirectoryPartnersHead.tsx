import { useId, type Ref } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DIRECTORY_PARTNER_LIMIT } from "../marketing/api/directoryPartners.api";
import { StudioAdminShelfMeter } from "./StudioAdminShelfParts";
import css from "./AdminDirectoryPartners.module.css";

/** The Partners tab's head: the heading (the focus fallback once the last
 *  row leaves), the intro, the "N of 12" count with its slot meter, and Add
 *  partner. At 12 the button stays in place, aria-disabled, and the reason
 *  folds in under it. */
export function AdminDirectoryPartnersHead({
  headingId,
  headingRef,
  count,
  isBusy,
  onAdd,
}: {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  count: number;
  isBusy: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const fullReasonId = useId();
  const max = DIRECTORY_PARTNER_LIMIT;
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
          {t("admin:directoryPartners.heading")}
        </h2>
        <span className={css.capacity}>
          <span className={css.count}>
            <Translation
              i18nKey="admin:directoryPartners.count"
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
      <p className={css.intro}>{t("admin:directoryPartners.intro")}</p>
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
          {t("admin:directoryPartners.addCta")}
        </Button>
      </div>
      <Collapse isOpen={isFull}>
        <p id={fullReasonId} className={css.fullReason}>
          {t("admin:directoryPartners.full", { max })}
        </p>
      </Collapse>
    </header>
  );
}
