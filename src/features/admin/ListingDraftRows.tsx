import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { memberRefToPerson } from "../../shared/api/refs";
import { routes } from "../../app/routeMap";
import {
  PILL_LABEL_KEYS,
  TOTAL_STEPS,
} from "../marketing/listBusiness/listBusiness.data";
import { AdminChip, AdminAvatar, type AvatarTone } from "./ui";
import { ListingDraftMessageModal } from "./ListingDraftMessageModal";
import {
  LISTING_DRAFT_STALLED_DAYS,
  draftIdleDays,
  type AdminListingDraftDTO,
} from "./api/adminListingDrafts.api";
import styles from "./EditSuggestions.module.css";

export function ListingDraftRows({
  drafts,
}: {
  drafts: AdminListingDraftDTO[];
}) {
  const { t } = useTranslation();
  const [messaging, setMessaging] = useState<AdminListingDraftDTO | null>(null);
  if (drafts.length === 0) {
    return <p className={styles.emptyLine}>{t("admin:listingDrafts.empty")}</p>;
  }
  return (
    <>
      <ul className={styles.rows}>
        {drafts.map((draft, index) => (
          <FadeIn key={draft.id} delay={Math.min(index, 8) * 50} as="li">
            <ListingDraftRow draft={draft} onMessage={setMessaging} />
          </FadeIn>
        ))}
      </ul>
      {messaging?.owner && (
        <ListingDraftMessageModal
          draft={messaging}
          owner={messaging.owner}
          onClose={() => setMessaging(null)}
        />
      )}
    </>
  );
}

function ListingDraftRow({
  draft,
  onMessage,
}: {
  draft: AdminListingDraftDTO;
  onMessage: (draft: AdminListingDraftDTO) => void;
}) {
  const { t, language } = useTranslation();
  const owner = memberRefToPerson(draft.owner);
  const idleDays = draftIdleDays(draft);
  const isStalled = idleDays >= LISTING_DRAFT_STALLED_DAYS;
  // Clamp so a payload from an older wizard with more steps still reads sanely.
  const stepIndex = Math.min(Math.max(draft.step, 0), TOTAL_STEPS - 1);
  const stepLabelKey = PILL_LABEL_KEYS[stepIndex];
  const displayName = draft.name.trim() || t("admin:listingDrafts.untitled");

  return (
    <div className={`${styles.row} ${styles.rowStacking}`}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{displayName}</span>
          {draft.path && (
            <AdminChip tone="plum">
              {t(`admin:listingDrafts.path.${draft.path}`)}
            </AdminChip>
          )}
          <AdminChip tone={isStalled ? "amber" : "jade"} dot>
            {isStalled
              ? t("admin:listingDrafts.stalled", { count: idleDays })
              : t("admin:listingDrafts.active")}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:listingDrafts.progress", {
            step: stepIndex + 1,
            total: TOTAL_STEPS,
            label: stepLabelKey ? t(stepLabelKey) : "",
          })}
          {draft.hood && ` · ${draft.hood}`}
          {" · "}
          {t("admin:listingDrafts.dates", {
            started: formatDate(draft.createdAt, language),
            edited: formatDate(draft.updatedAt, language),
          })}
        </div>
        <div className={styles.rowSubmitter}>
          <AdminAvatar
            initials={owner?.initials ?? "?"}
            tone={(owner?.tint as AvatarTone | undefined) ?? "anon"}
            size="sm"
            src={owner?.avatarUrl ?? undefined}
          />
          <span>
            {t("admin:listingDrafts.startedBy", {
              name: owner?.name ?? t("admin:listingDrafts.unknownOwner"),
            })}
          </span>
        </div>
      </div>
      {owner && (
        <div className={styles.rowActions}>
          <Button
            variant="ghost"
            size="md"
            to={`${routes.members}/${owner.slug}`}
          >
            {t("admin:listingDrafts.profileCta")}
          </Button>
          <Button variant="jade" size="md" onClick={() => onMessage(draft)}>
            <FiMessageCircle aria-hidden />
            {t("admin:listingDrafts.messageCta", { name: owner.firstName })}
          </Button>
        </div>
      )}
    </div>
  );
}
