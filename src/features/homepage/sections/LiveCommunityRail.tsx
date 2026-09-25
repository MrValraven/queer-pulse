import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityType } from "../../communities/api/communities.api";
import type { CommunitySpotlightView } from "./communitySpotlightView";
import styles from "./Communities.module.css";

const CATEGORY_LABEL_KEY: Record<CommunityType, string> = {
  social: "homepage:communities.category.social",
  arts: "homepage:communities.category.arts",
  activism: "homepage:communities.category.activism",
  support: "homepage:communities.category.support",
  sports: "homepage:communities.category.sports",
  professional: "homepage:communities.category.professional",
};

interface LiveRailProps {
  list: CommunitySpotlightView[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onClear: () => void;
}

/**
 * Live analog of `CommunityRail`. The row dot is a single neutral colour for
 * every category, not colour-coded per type (see `LiveCommunitiesToolbar`
 * for why) — it's kept only so `.railRow`'s 3-column grid still lines up.
 * The category label stands in as the row's subtitle instead of the demo's
 * bespoke tagline, since that's the only short categorical text real
 * communities have.
 */
export function LiveCommunityRail({
  list,
  selectedKey,
  onSelect,
  onClear,
}: LiveRailProps) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.rail}>
      <div className={styles.railLab}>
        {list.length ? (
          <Translation
            i18nKey="homepage:communities.rail.showingCount"
            values={{ count: list.length }}
            slots={{
              count: (
                <RollingNumber
                  value={fmt.number(list.length)}
                  numericValue={list.length}
                />
              ),
            }}
          />
        ) : (
          t("homepage:communities.rail.noMatches")
        )}
      </div>

      {list.length === 0 ? (
        <div className={styles.railEmpty}>
          <b>{t("homepage:communities.rail.emptyTitle")}</b>
          <br />
          {t("homepage:communities.rail.emptyBody")}
          <br />
          <button type="button" onClick={onClear}>
            {t("homepage:communities.clearFiltersCta")}
          </button>
        </div>
      ) : (
        list.map((view) => (
          <button
            key={view.key}
            type="button"
            className={[
              styles.railRow,
              view.key === selectedKey && styles.railRowActive,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={view.key === selectedKey ? "true" : undefined}
            onClick={() => onSelect(view.key)}
          >
            <span
              className={[styles.railDot, styles.dotQuiet]
                .filter(Boolean)
                .join(" ")}
              aria-hidden
            />
            <span className={styles.railText}>
              <span className={styles.railName}>{view.name}</span>
              <span className={styles.railSub}>
                {t(CATEGORY_LABEL_KEY[view.category])}
              </span>
            </span>
            <span className={styles.railMem}>{view.memberCount}</span>
          </button>
        ))
      )}
    </div>
  );
}
