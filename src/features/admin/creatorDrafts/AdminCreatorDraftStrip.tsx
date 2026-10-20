import type { ReactNode } from "react";
import { FiEdit3, FiExternalLink, FiMessageCircle } from "react-icons/fi";
import {
  businessPath,
  communityPath,
  personaPath,
  routes,
} from "../../../app/routeMap";
import { memberRefToPerson } from "../../../shared/api/refs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type {
  AdminCreatorDraftDetail,
  CreatorDraftMadeFor,
} from "../api/adminCreatorDrafts.api";
import { teamListingFromDraftPath } from "../listingDraftHandover";
import { AdminAvatar, AdminChip, type AvatarTone } from "../ui";
import {
  CREATOR_DRAFT_KIND_LABEL_KEYS,
  creatorDraftMadeForText,
  creatorDraftMissingLabels,
  creatorDraftProgressText,
} from "./adminCreatorDraftLabels";
import styles from "./AdminCreatorDraft.module.css";

/** The public page a made-for points at; null when nothing live exists to
 *  link (a persona draft, a draft persona's Studio work, a listing that is
 *  not live), so the name shows as plain text. */
function madeForPath(madeFor: CreatorDraftMadeFor): string | null {
  if (!madeFor.slug) return null;
  switch (madeFor.kind) {
    case "community":
      return communityPath(madeFor.slug);
    case "listing":
      return businessPath(madeFor.slug);
    case "persona":
      return personaPath(madeFor.slug);
  }
}

function MadeForName({ madeFor }: { madeFor: CreatorDraftMadeFor }) {
  const { t } = useTranslation();
  const text = creatorDraftMadeForText(madeFor, t);
  const path = madeForPath(madeFor);
  if (!path) return <span className={styles.madeFor}>{text}</span>;
  return (
    <Button variant="ghost" size="sm" to={path}>
      {text}
    </Button>
  );
}

function StripFact({
  label,
  isWide = false,
  children,
}: {
  label: string;
  /** Takes the whole row, for a value that wraps (the missing chips). */
  isWide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={isWide ? `${styles.fact} ${styles.factWide}` : styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

function OwnerFact({ detail }: { detail: AdminCreatorDraftDetail }) {
  const { t } = useTranslation();
  const owner = memberRefToPerson(detail.owner);
  return (
    <StripFact label={t("admin:creatorDrafts.strip.owner")}>
      <span className={styles.owner}>
        <AdminAvatar
          initials={owner?.initials ?? "?"}
          tone={(owner?.tint as AvatarTone | undefined) ?? "anon"}
          size="sm"
          src={owner?.avatarUrl ?? undefined}
        />
        <span className={styles.ownerName}>
          {owner?.name ?? t("admin:creatorDrafts.strip.noOwner")}
        </span>
        {owner && (
          <Button
            variant="ghost"
            size="sm"
            to={`${routes.members}/${owner.slug}`}
          >
            {t("admin:creatorDrafts.profileCta")}
          </Button>
        )}
      </span>
    </StripFact>
  );
}

/** `missing` null: this kind reports no checklist (a listing, a Studio
 *  episode), so the fact stays off the strip. An empty list is a draft with
 *  everything filled in. */
function MissingFact({ detail }: { detail: AdminCreatorDraftDetail }) {
  const { t } = useTranslation();
  if (detail.missing === null) return null;
  const labels = creatorDraftMissingLabels(detail.kind, detail.missing, t);
  return (
    <StripFact label={t("admin:creatorDrafts.strip.missing")} isWide>
      {labels.length === 0 ? (
        <span className={styles.quietValue}>
          {t("admin:creatorDrafts.strip.nothingMissing")}
        </span>
      ) : (
        <ul className={styles.chipRow}>
          {labels.map((label) => (
            <li key={label}>
              <AdminChip tone="ghost">{label}</AdminChip>
            </li>
          ))}
        </ul>
      )}
    </StripFact>
  );
}

function StripActions({
  detail,
  onMessageOwner,
}: {
  detail: AdminCreatorDraftDetail;
  onMessageOwner: () => void;
}) {
  const { t } = useTranslation();
  const liveListingSlug =
    detail.kind === "listing_edit" ? detail.listing.slug : null;
  const hasAction =
    detail.owner !== null ||
    detail.kind === "listing" ||
    liveListingSlug !== null;
  if (!hasAction) return null;
  return (
    <div className={styles.actions}>
      {detail.owner && (
        <Button variant="jade" size="md" onClick={onMessageOwner}>
          <FiMessageCircle aria-hidden />
          {t("admin:creatorDrafts.messageCta", {
            name: detail.owner.firstName,
          })}
        </Button>
      )}
      {/* Opens the add-a-listing form on this draft's business details, as
          the listing drafts tab does. */}
      {detail.kind === "listing" && (
        <Button
          variant="ghost"
          size="md"
          to={teamListingFromDraftPath(detail.id)}
        >
          <FiEdit3 aria-hidden />
          {t("admin:listingDrafts.finishCta")}
        </Button>
      )}
      {liveListingSlug && (
        <Button variant="ghost" size="md" to={businessPath(liveListingSlug)}>
          <FiExternalLink aria-hidden />
          {t("admin:creatorDrafts.openLiveListing")}
        </Button>
      )}
    </div>
  );
}

/**
 * What staff need before they read the preview: the draft's kind, who made it
 * and for whom, when it was last saved, how far it got and what is still
 * missing, then the ways to reach out. Every action here leaves the draft as
 * the creator left it.
 */
export function AdminCreatorDraftStrip({
  detail,
  onMessageOwner,
}: {
  detail: AdminCreatorDraftDetail;
  onMessageOwner: () => void;
}) {
  const { t, language } = useTranslation();
  const progressText = creatorDraftProgressText(detail.progress, t);
  return (
    <div
      role="group"
      aria-label={t("admin:creatorDrafts.strip.label")}
      className={styles.strip}
    >
      <div className={styles.stripTop}>
        <AdminChip tone="amber" dot>
          {t("admin:creatorDrafts.strip.unfinished")}
        </AdminChip>
        {detail.madeFor && <MadeForName madeFor={detail.madeFor} />}
      </div>
      <dl className={styles.facts}>
        <StripFact label={t("admin:creatorDrafts.strip.kind")}>
          <AdminChip tone="plum">
            {t(CREATOR_DRAFT_KIND_LABEL_KEYS[detail.kind])}
          </AdminChip>
        </StripFact>
        <OwnerFact detail={detail} />
        <StripFact label={t("admin:creatorDrafts.strip.lastSaved")}>
          <time dateTime={detail.lastSavedAt}>
            {formatDate(detail.lastSavedAt, language)}
          </time>
        </StripFact>
        {progressText && (
          <StripFact label={t("admin:creatorDrafts.strip.progress")}>
            {progressText}
          </StripFact>
        )}
        <MissingFact detail={detail} />
      </dl>
      <StripActions detail={detail} onMessageOwner={onMessageOwner} />
    </div>
  );
}
