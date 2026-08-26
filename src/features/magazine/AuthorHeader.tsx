import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiUser } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { routes } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { AuthorProfileEditor } from "./AuthorProfileEditor";
import { useAuthorEditPermission } from "./api/useAuthorMutations";
import { nodeToText, nodeToTitleText } from "./nodeText";
import type { Author } from "./authorContent.data";
import styles from "./AuthorPage.module.css";

export function AuthorHeader({ author }: { author: Author }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isFollowing, toggleFollow, followEnabled } = useSocial();
  const following = isFollowing(author.slug);
  const label = author.firstName;
  // CON-11 — who may fill in this byline's bio and portrait, and through
  // which endpoint (staff go through the admin route, the linked member
  // through /authors/me).
  const { canEdit, canEditName, isStaffEditor } = useAuthorEditPermission({
    slug: author.slug,
    memberSlug: author.memberSlug,
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <>
      <header className={styles.hero}>
        <div>
          {/* Content: eyebrow/name/role/bio/pronouns are the writer's own
              profile fields — kept in English like a member bio. */}
          <div className={styles.eyebrow}>{author.eyebrow}</div>
          <h1 className={styles.name}>
            <span className={styles.nameRow}>
              {author.name}
              {/* Badge the MEMBER behind the byline, not the byline slug: an
                  auto-created byline slug is a slugified name, which only
                  coincidentally matches a member slug. */}
              <MemberStaffBadge slug={author.memberSlug ?? undefined} />
            </span>
          </h1>
          <div className={styles.role}>{author.role}</div>
          <p className={styles.bio}>{author.bio}</p>
          <div className={styles.metaRow}>
            {/* Member-level follow has no live backend (only per-subprofile
                persona follow does), so hide the control unless it's real. */}
            {followEnabled && (
              <Button
                variant={following ? "ghost" : "primary"}
                onClick={() => {
                  const now = toggleFollow(author.slug);
                  showToast(
                    now
                      ? t("magazine:author.followingToast", { name: label })
                      : t("magazine:author.unfollowedToast", { name: label }),
                    now ? "success" : "info",
                  );
                }}
              >
                {following
                  ? t("magazine:author.followingCta")
                  : t("magazine:author.followWriterCta")}
              </Button>
            )}
            <span className={styles.pronouns}>{author.pronouns}</span>
          </div>

          {/* CON-11 — the byline as a person: a link back to their member
              profile when the byline is a real account, and the editor for
              whoever is allowed to fill it in. */}
          {(author.memberSlug || canEdit) && (
            <div className={styles.identityRow}>
              {author.memberSlug && (
                <Link
                  className={styles.memberLink}
                  to={`${routes.members}/${author.memberSlug}`}
                >
                  <FiUser aria-hidden />
                  {t("magazine:author.viewMemberProfile", { name: label })}
                </Link>
              )}
              {canEdit && (
                <button
                  type="button"
                  className={styles.editByline}
                  onClick={() => setIsEditorOpen(true)}
                >
                  <FiEdit2 aria-hidden />
                  {isStaffEditor
                    ? t("magazine:author.editBylineCta")
                    : t("magazine:author.editMyBylineCta")}
                </button>
              )}
            </div>
          )}
        </div>
        <ImageSlot
          tint="coral"
          radius={24}
          className={styles.portrait}
          src={author.portrait}
          alt={t("magazine:author.portraitAlt", { slug: author.slug })}
          placeholder={t("magazine:author.portraitPlaceholder")}
          style={{ aspectRatio: "4/5", height: "auto" }}
        />
      </header>

      <div className={styles.stats}>
        {author.stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <b>{stat.value}</b>
            {stat.label}
          </div>
        ))}
      </div>

      <div className={styles.beats}>
        {author.beats.map((beat, index) => (
          <span
            key={beat}
            className={[styles.beat, index === 0 && styles.beatPrimary]
              .filter(Boolean)
              .join(" ")}
          >
            {beat}
          </span>
        ))}
      </div>

      {isEditorOpen && (
        <AuthorProfileEditor
          initial={{
            slug: author.slug,
            // The view model carries the display name as a node (the curated
            // registry splits a coral <em> into the surname), so flatten it
            // for the text input.
            name: nodeToTitleText(author.name),
            bio: nodeToText(author.bio),
            avatarUrl: author.portrait,
          }}
          canEditName={canEditName}
          asStaff={isStaffEditor}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </>
  );
}
