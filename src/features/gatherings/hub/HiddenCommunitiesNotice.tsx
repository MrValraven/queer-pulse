import { Collapse } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHiddenEventCommunities } from "../api/useHiddenEventCommunities";
import styles from "./HiddenCommunitiesNotice.module.css";

/**
 * A quiet line under the Browse filters while the member hides at least one
 * community, so a shorter board never reads as a quiet month. "Manage" opens
 * the Refine drawer at the hidden-communities band.
 *
 * Always mounted: the line folds in when the first community is hidden and
 * folds away when the last one comes back, and its count rolls between.
 */
export function HiddenCommunitiesNotice({
  onManage,
}: {
  onManage: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { communities } = useHiddenEventCommunities();
  const hiddenCount = communities.length;

  return (
    <Collapse isOpen={hiddenCount > 0}>
      <p className={styles.notice}>
        <span>
          <Translation
            i18nKey="gatherings:hiddenCommunities.notice.text"
            values={{ count: hiddenCount }}
            slots={{
              count: (
                <RollingNumber
                  value={fmt.number(hiddenCount)}
                  numericValue={hiddenCount}
                />
              ),
            }}
          />
        </span>{" "}
        <button type="button" className={styles.manage} onClick={onManage}>
          {t("gatherings:hiddenCommunities.notice.manage")}
        </button>
      </p>
    </Collapse>
  );
}
