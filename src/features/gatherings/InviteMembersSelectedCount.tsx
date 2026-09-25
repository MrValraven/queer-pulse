import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ManageCohosts.module.css";

/** The "N selected" line under the invite picker. The count rolls as members
 *  are ticked, and the cap warning joins it once `max` is reached. */
export function InviteMembersSelectedCount({
  count,
  max,
}: {
  count: number;
  max: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.selCount}>
      {count === 0 ? (
        t("gatherings:manage.invite.noneSelected")
      ) : (
        <>
          <Translation
            i18nKey="gatherings:manage.invite.selectedCount"
            values={{ count }}
            components={{ b: <b /> }}
            slots={{
              count: (
                <RollingNumber value={fmt.number(count)} numericValue={count} />
              ),
            }}
          />
          {count >= max && (
            <span className={styles.capWarn}>
              {t("gatherings:manage.invite.capWarning", { max })}
            </span>
          )}
        </>
      )}
    </div>
  );
}
