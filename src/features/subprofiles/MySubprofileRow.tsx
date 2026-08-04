import { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import { HiOutlineQrCode } from "react-icons/hi2";
import {
  Avatar,
  Badge,
  Button,
  VisibilityBadge,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { initialsFromName } from "../../shared/lib/initials";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaShareUrlForOwner } from "./personaLinks.data";
import { SubprofileShareCard } from "./SubprofileShareCard";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { LINK_BADGE, STATUS_BADGE } from "./mySubprofiles.data";
import styles from "./MySubprofilesPage.module.css";

/**
 * Adapt an owner-dashboard row (`SubprofileView`, no owner-tie/social-proof
 * fields — every row is implicitly owned by the signed-in member) into the
 * `PublicSubprofileView` shape `SubprofileShareCard` reads, so the share card
 * is a single implementation shared by the public hero and this row. Mirrors
 * `personaPublicPathForOwner`'s linked-vs-standalone `ownerSlug` rule; the
 * owner-viewing-their-own-card social-proof fields don't apply here, so they
 * default to `false`.
 */
function toPublicView(
  subprofile: SubprofileView,
  ownerSlug: string,
): PublicSubprofileView {
  return {
    ...subprofile,
    ownerSlug: subprofile.linkVisibility === "linked" ? ownerSlug : undefined,
    ownerName: undefined,
    viewerEndorsed: false,
    viewerFollowing: false,
    // The signed-in owner is trivially a member of their own persona.
    viewerIsMember: true,
  };
}

/**
 * One persona row on the dashboard: avatar, name, and the badges that tell the
 * owner its state at a glance (kind, draft/published, linked/standalone,
 * who-can-see-it), plus Edit and Delete actions.
 */
export function MySubprofileRow({
  subprofile,
  onDelete,
}: {
  subprofile: SubprofileView;
  onDelete: (subprofile: SubprofileView) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { profile } = useProfileData();
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const status = STATUS_BADGE[subprofile.status];
  const link = LINK_BADGE[subprofile.linkVisibility];
  const editPath = `/account/subprofiles/${subprofile.id}/edit`;

  async function handleShare() {
    const url = personaShareUrlForOwner(subprofile, profile.slug);
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("subprofiles:share.copied"), "success");
    } catch {
      // Clipboard permission denied/unavailable — nothing actionable to do.
    }
  }

  return (
    <>
      <article className={styles.row}>
        <Avatar
          initials={initialsFromName(subprofile.displayName, "?")}
          src={subprofile.avatarUrl ?? undefined}
          tint="plum"
          size={52}
        />
        <div className={styles.rowMain}>
          <h2 className={styles.rowName}>
            {subprofile.displayName || t("subprofiles:mine.untitled")}
          </h2>
          <div className={styles.rowBadges}>
            <Badge tone="ghost">{t(KIND_LABEL_KEYS[subprofile.kind])}</Badge>
            <Badge tone={status.tone} dot>
              {t(status.labelKey)}
            </Badge>
            <Badge tone={link.tone}>{t(link.labelKey)}</Badge>
            <VisibilityBadge mode={subprofile.visibility} />
            <span className={styles.count}>
              {t("subprofiles:mine.endorsementCount", {
                count: subprofile.endorsementCount,
              })}
            </span>
            <span className={styles.count}>
              {t("subprofiles:mine.followerCount", {
                count: subprofile.followerCount,
              })}
            </span>
          </div>
        </div>
        <div className={styles.rowActions}>
          <Button variant="ghost" onClick={() => void handleShare()}>
            <FiShare2 aria-hidden /> {t("subprofiles:share.cta")}
          </Button>
          <Button variant="ghost" onClick={() => setShareCardOpen(true)}>
            <HiOutlineQrCode aria-hidden /> {t("subprofiles:shareCard.cta")}
          </Button>
          <Button variant="ghost" to={editPath}>
            {t("subprofiles:mine.rowEdit")}
          </Button>
          <Button variant="ghost" onClick={() => onDelete(subprofile)}>
            {t("subprofiles:mine.rowDelete")}
          </Button>
        </div>
      </article>

      {shareCardOpen && (
        <SubprofileShareCard
          view={toPublicView(subprofile, profile.slug)}
          onClose={() => setShareCardOpen(false)}
        />
      )}
    </>
  );
}
