import { useProfile } from "../../app/providers/ProfileProvider";
import { useMyCommunityCards } from "../members/useMyCommunityCards";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { Button } from "../../shared/components/ui";
import type { ProfileSection } from "./EditProfilePane";
import pageStyles from "./EditProfilePage.module.css";
import styles from "./CommunitiesPickerSection.module.css";

const MAX_FEATURED = 6;

/** Compact ghost-button sizing shared with the other Edit Profile sections'
 * secondary actions (see IdentitySection/SkillsSection) — the `<Button>`
 * primitive only ships `md`/`lg` sizes, no `sm`. */
const compactButtonStyle = { fontSize: "13.5px", padding: "9px 18px" };

interface CommunitiesPickerSectionProps {
  /** Reported after every draft mutation (feature/un-feature/reorder), so the
   * host's dirty-tracking (save bar + "Saved. Updated …" confirmation) picks
   * up communities-only edits the same way every other section does. */
  onChange?: (section: ProfileSection) => void;
}

/**
 * Edit Profile "Communities" picker — toggle which of the member's own
 * (non-private) communities are featured on their profile, and reorder the
 * featured set. Featured rows render first (in pin order) with up/down
 * reorder controls; the remaining eligible communities render below with a
 * Feature action, disabled once the cap is reached. Writes slugs straight to
 * `draft.featuredCommunities` via `updateDraft` — no local state.
 */
export function CommunitiesPickerSection({
  onChange,
}: CommunitiesPickerSectionProps) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfile();
  const eligibleCommunities = useMyCommunityCards();
  const featuredSlugs = draft.featuredCommunities;
  const atCap = featuredSlugs.length >= MAX_FEATURED;

  function setFeaturedSlugs(nextSlugs: string[]) {
    updateDraft({ featuredCommunities: nextSlugs });
    onChange?.("communities");
  }

  function toggleFeatured(slug: string) {
    setFeaturedSlugs(
      featuredSlugs.includes(slug)
        ? featuredSlugs.filter((featuredSlug) => featuredSlug !== slug)
        : [...featuredSlugs, slug],
    );
  }

  function moveFeatured(slug: string, delta: -1 | 1) {
    const currentIndex = featuredSlugs.indexOf(slug);
    const targetIndex = currentIndex + delta;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= featuredSlugs.length
    ) {
      return;
    }
    const nextSlugs = [...featuredSlugs];
    const movedSlug = nextSlugs[currentIndex]!;
    nextSlugs[currentIndex] = nextSlugs[targetIndex]!;
    nextSlugs[targetIndex] = movedSlug;
    setFeaturedSlugs(nextSlugs);
  }

  // Featured first, in pin order; then the rest of what's eligible.
  const featuredCommunityRefs = featuredSlugs
    .map((slug) =>
      eligibleCommunities.find((communityRef) => communityRef.slug === slug),
    )
    .filter(
      (communityRef): communityRef is NonNullable<typeof communityRef> =>
        Boolean(communityRef),
    );
  const remainingCommunityRefs = eligibleCommunities.filter(
    (communityRef) => !featuredSlugs.includes(communityRef.slug),
  );

  return (
    <div className={pageStyles.section} id="communities">
      <h2 className={pageStyles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.communities.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={pageStyles.sectionSub}>
        {t("settings:editProfile.communities.sub")}
      </p>
      <p className={styles.counter}>
        {t("settings:editProfile.communities.counter", {
          count: featuredSlugs.length,
        })}
      </p>

      {eligibleCommunities.length === 0 ? (
        <p className={styles.empty}>
          {t("settings:editProfile.communities.emptyHint")}
        </p>
      ) : (
        <ul className={styles.list}>
          {featuredCommunityRefs.map((communityRef, position) => (
            <li key={communityRef.slug} className={styles.row}>
              <span className={styles.rowName}>{communityRef.name}</span>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.reorder}
                  aria-label={t("settings:editProfile.communities.moveUp")}
                  disabled={position === 0}
                  onClick={() => moveFeatured(communityRef.slug, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.reorder}
                  aria-label={t("settings:editProfile.communities.moveDown")}
                  disabled={position === featuredCommunityRefs.length - 1}
                  onClick={() => moveFeatured(communityRef.slug, 1)}
                >
                  ↓
                </button>
                <Button
                  variant="ghost"
                  onClick={() => toggleFeatured(communityRef.slug)}
                  style={compactButtonStyle}
                >
                  {t("settings:editProfile.communities.featured")}
                </Button>
              </div>
            </li>
          ))}
          {remainingCommunityRefs.map((communityRef) => (
            <li key={communityRef.slug} className={styles.row}>
              <span className={styles.rowName}>{communityRef.name}</span>
              <Button
                variant="ghost"
                disabled={atCap}
                title={
                  atCap
                    ? t("settings:editProfile.communities.capHint")
                    : undefined
                }
                onClick={() => toggleFeatured(communityRef.slug)}
                style={compactButtonStyle}
              >
                {t("settings:editProfile.communities.feature")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
