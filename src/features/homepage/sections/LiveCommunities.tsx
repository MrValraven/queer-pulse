import { useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHowCommunitiesWorkModal } from "../../marketing/useHowCommunitiesWorkModal";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import { FeaturedCommunityCard } from "./FeaturedCommunityCard";
import { landingCommunityToView } from "./communitySpotlightView";
import { useLiveCommunityFilters } from "./useLiveCommunityFilters";
import { LiveCommunitiesToolbar } from "./LiveCommunitiesToolbar";
import { LiveCommunityRail } from "./LiveCommunityRail";
import spot from "./Communities.module.css";
import styles from "./LiveSections.module.css";

function EmptySpotlight({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <article className={spot.spot}>
      <div className={spot.spotEmpty}>
        <h3>{t("homepage:communities.spotlight.emptyTitle")}</h3>
        <p>{t("homepage:communities.spotlight.emptyBody")}</p>
        <div className={spot.emptyActions}>
          <Button variant="primary" onClick={onClear}>
            {t("homepage:communities.clearFiltersCta")}
          </Button>
          <Button variant="ghost" to={routes.startCommunity}>
            {t("homepage:communities.spotlight.startCommunityCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

/**
 * Live-mode counterpart to `Communities`: the same search/filter/sort +
 * rail + spotlight layout the demo showcase uses, sourced from the
 * admin-curated `/landing/features` feed instead of the demo fixtures. All
 * filtering happens client-side over that already-loaded curated set — it's
 * a handful of communities, not a paginated catalogue, so no new API calls
 * are needed. The public feed carries only what real communities actually
 * have, so language/area filters and the founder-quote/trend/rooms bits of
 * the demo spotlight are left out (see `useLiveCommunityFilters` and
 * `CommunitySpotlightView`). Renders nothing when nothing is curated yet: an
 * empty section beats inventing communities.
 */
export function LiveCommunities() {
  const { t } = useTranslation();
  const { openModal, modalElement } = useHowCommunitiesWorkModal();
  const { communities, isLoading } = useLandingFeaturesPublic();

  const views = useMemo(
    () => communities.map(landingCommunityToView),
    [communities],
  );

  const { state, patch, clear, visible, total } = useLiveCommunityFilters(views);

  const [selectedKey, setSelectedKey] = useState<string | null>(
    views[0]?.key ?? null,
  );

  // Derive the effective selection during render (no syncing effect): if the
  // picked community has been filtered out, fall back to the first visible one.
  const activeKey =
    selectedKey && visible.some((v) => v.key === selectedKey)
      ? selectedKey
      : (visible[0]?.key ?? null);

  const selectCommunity = (key: string) => {
    if (key === activeKey) return;
    setSelectedKey(key);
  };

  const selected = visible.find((v) => v.key === activeKey) ?? null;
  const shown = visible.length;

  if (isLoading || total === 0) return null;

  return (
    <section className={styles.section} id="communities">
      <div className="wrap">
        <Reveal>
          <div className={styles.head}>
            <div className={styles.headText}>
              <div className={styles.eyebrow}>
                {t("homepage:communities.eyebrow")}
              </div>
              <h2 className={styles.title}>
                <Translation
                  i18nKey="homepage:communities.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p className={styles.sub}>{t("homepage:liveCommunities.sub")}</p>
            </div>
            <div>
              <Button variant="ghost" onClick={openModal}>
                {t("homepage:communities.howCommunitiesWorkCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <LiveCommunitiesToolbar state={state} patch={patch} />
        </Reveal>

        <Reveal>
          <p className={spot.resultCount}>
            <Translation
              i18nKey={
                shown === total
                  ? "homepage:communities.resultCount.all"
                  : "homepage:communities.resultCount.shown"
              }
              values={{ count: shown, total }}
              components={{ b: <b /> }}
            />
          </p>
        </Reveal>

        <Reveal>
          <div className={spot.grid}>
            <LiveCommunityRail
              list={visible}
              selectedKey={activeKey}
              onSelect={selectCommunity}
              onClear={clear}
            />
            {selected ? (
              <FeaturedCommunityCard key={activeKey} items={[selected]} />
            ) : (
              <EmptySpotlight onClear={clear} />
            )}
          </div>
        </Reveal>
      </div>
      {modalElement}
    </section>
  );
}
