import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminPageHeader } from "./ui";
import { AdminCommunitySpaces } from "./AdminCommunitySpaces";
import { BackToGridButton } from "./AdminCommunityDetailHeader";
import type { Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

/** The header shown while the community loads, after it fails, or when its
 *  slug matches no community: the section's own title and the way back, so a
 *  stalled fetch never strands the admin on a dead screen. */
export function PlaceholderHeader() {
  const { t } = useTranslation();
  return (
    <AdminPageHeader
      eyebrow={t("shared:adminNav.sections.communities")}
      title={
        <Translation
          i18nKey="admin:communities.title"
          components={{ em: <em /> }}
        />
      }
      actions={<BackToGridButton />}
    />
  );
}

/** The overview area's parent/spaces line: a space names the community it
 *  lives inside; a top-level community lists the spaces it hosts. `onOpen`
 *  receives the slug of whichever community is clicked. */
export function SpacesOverview({
  community,
  onOpen,
}: {
  community: Community;
  onOpen: (slug: string) => void;
}) {
  const { t } = useTranslation();
  if (community.parent) {
    const parent = community.parent;
    return (
      <button
        type="button"
        className={styles.linkBtn}
        onClick={() => onOpen(parent.slug)}
      >
        {t("admin:communities.detail.parent", { name: parent.name })}
      </button>
    );
  }
  return <AdminCommunitySpaces community={community} onOpen={onOpen} />;
}
