import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity, SpaceCardModel } from "./community.model";
import { useSubcommunities } from "./api/useSubcommunities";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { SpaceCard } from "./SpaceCard";
import gridStyles from "./CommunitiesPage.module.css";
import detailStyles from "./CommunityDetailPage.module.css";
import styles from "./SpacesTab.module.css";

/** Placeholder count while the grid loads, matching the Discover grid's
 *  own loading rhythm. */
const SKELETON_COUNT = 3;

/**
 * The Spaces tab on a top-level community's own page: the smaller spaces
 * (subcommunities) founded inside it. `LivingHubTabs` only renders this on
 * a top-level community that may host spaces or still hosts some, the same
 * condition that gates the tab itself.
 *
 * Fetching the grid needs the same standing the backend requires of
 * `GET /communities/:slug/subcommunities`: a public parent's spaces are open
 * to any viewer, and every other tier requires the viewer to already be on
 * the parent's own roster (a non-member there gets a 403). `isParentMember`
 * is what decides both whether the fetch runs at all and whether the note
 * beneath the intro asks the viewer to join the parent first.
 */
export function SpacesTab({
  living,
  name,
  isParentMember,
}: {
  living: LivingCommunity;
  /** This (parent) community's display name, interpolated into the intro and
   *  the non-member join note. Not carried on `LivingCommunity` itself, so
   *  the caller passes it through from the `Community` it already has. */
  name: string;
  isParentMember: boolean;
}) {
  const { t } = useTranslation();
  // The space whose join wizard is open from its card, or null. Held here so
  // the wizard mounts outside the card's `<Link>`.
  const [joiningSpace, setJoiningSpace] = useState<SpaceCardModel | null>(null);
  const canFetchSpaces = isParentMember || living.accessTier === "public";
  const { spaces, isLoading, isError, refetch } = useSubcommunities(
    living.slug,
    { enabled: canFetchSpaces },
  );

  return (
    <div>
      <div className={detailStyles.secLbl}>
        {t("communities:detail.tabs.spaces")}
      </div>
      <p className={styles.intro}>
        {t("communities:spaces.tab.intro", { name })}
      </p>

      {!isParentMember && (
        <p className={styles.joinNote}>
          <FiLock aria-hidden />
          {t("communities:spaces.join.parentFirst", { name })}
        </p>
      )}

      {/* A gated parent's non-member never reaches the fetch (the backend
          would 403 it); the note above already says what to do next, so no
          loading, error or empty state renders on top of it. */}
      {canFetchSpaces &&
        (isLoading ? (
          <div className={gridStyles.grid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <SkeletonLine
                key={index}
                height={220}
                style={{ borderRadius: 16 }}
              />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            compact
            title={t("communities:spaces.tab.error")}
            action={{
              label: t("communities:spaces.tab.retry"),
              onClick: () => refetch(),
            }}
          />
        ) : spaces.length === 0 ? (
          <EmptyState
            title={t("communities:spaces.tab.empty.title")}
            description={t("communities:spaces.tab.empty.body")}
          />
        ) : (
          <div className={gridStyles.grid}>
            {spaces.map((space, index) => (
              <FadeIn
                key={space.slug ?? space.name}
                delay={Math.min(index, 8) * 60}
              >
                <SpaceCard
                  space={space}
                  isParentMember={isParentMember}
                  parentName={name}
                  onJoin={setJoiningSpace}
                />
              </FadeIn>
            ))}
          </div>
        ))}

      {joiningSpace && (
        <CommunityJoinFlowModal
          community={joiningSpace}
          parentName={name}
          onClose={() => setJoiningSpace(null)}
        />
      )}
    </div>
  );
}
