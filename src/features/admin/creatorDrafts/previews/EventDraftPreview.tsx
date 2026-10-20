import { useMemo } from "react";
import { Tag } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MentionText } from "../../../../shared/mentions/MentionText";
import { GatheringCover } from "../../../gatherings/GatheringCover";
import { GatheringDetailPanels } from "../../../gatherings/GatheringDetailPanels";
import { GatheringGoodToKnow } from "../../../gatherings/GatheringGoodToKnow";
import { GatheringTakingCare } from "../../../gatherings/GatheringTakingCare";
import { formatLabel } from "../../../gatherings/gatheringCatalog";
import { gatheringKind, type GatheringDetail } from "../../../gatherings/data";
import { eventZoneFormat } from "../../../gatherings/eventTimezone";
import { gatheringWhen } from "../../../gatherings/gatheringSchedule";
import { GatheringPreviewProvider } from "../../../gatherings/guestPreview/GatheringPreviewProvider";
import type {
  CreatorDraftOwner,
  EventDraftPreview as EventDraftPreviewData,
} from "../../api/adminCreatorDrafts.api";
import { creatorDraftTitleText } from "../adminCreatorDraftLabels";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";
import {
  eventDraftPreviewSchedule,
  eventDraftPreviewToGatheringDetail,
} from "./eventDraftPreviewToGatheringDetail";
import styles from "../../../gatherings/GatheringPage.module.css";
import frameStyles from "./CreatorDraftPreviews.module.css";

/** The owner's name as the public page prints the host, or "" when the
 *  account is gone. */
function ownerName(owner: CreatorDraftOwner | null): string {
  if (!owner) return "";
  return `${owner.firstName} ${owner.lastName}`.trim();
}

/** The business that runs the event, when the preview names one. */
function runByName(preview: EventDraftPreviewData): string {
  const name: unknown = preview.runByListing?.name;
  return typeof name === "string" ? name : "";
}

/** One dotted item of the meta row, left out when it has nothing to say. */
function MetaItem({ text }: { text: string }) {
  if (text.trim() === "") return null;
  return (
    <span className={styles.metaItem}>
      <span className={styles.metaDot} />
      {text}
    </span>
  );
}

/**
 * The public page's meta row as a guest reads it: the date, the clock, the
 * neighbourhood and the host, then the community and the business that runs
 * it. Staff follow no link from a preview, so the community and the business
 * are plain text. A day or a clock the host has not set yet is left out.
 */
function EventDraftPreviewMeta({
  gathering,
  preview,
}: {
  gathering: GatheringDetail;
  preview: EventDraftPreviewData;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  const when = gatheringWhen(
    gathering.date,
    gathering.endAt,
    fmt,
    t,
    { day: "numeric", month: "long", year: "numeric", ...zone.dateOptions },
    zone.timeOptions,
  );
  const { hasDate, hasTime } = eventDraftPreviewSchedule(preview);
  const hoodText = gathering.isOnline
    ? t("gatherings:common.online")
    : gathering.hood;
  const businessName = runByName(preview);
  return (
    <div className={styles.meta}>
      {hasDate && <MetaItem text={when.dateText} />}
      {hasTime && (
        <MetaItem
          text={
            when.nextDayNote
              ? `${when.timeText} ${when.nextDayNote}`
              : when.timeText
          }
        />
      )}
      <MetaItem text={hoodText} />
      {gathering.host !== "" && (
        <MetaItem
          text={`${t("gatherings:common.hostedBy")} ${gathering.host}`}
        />
      )}
      {gathering.community && (
        <MetaItem
          text={t("gatherings:common.hostedWithList.one", {
            first: gathering.community.name,
          })}
        />
      )}
      {businessName !== "" && (
        <MetaItem text={`${t("gatherings:common.runBy")} ${businessName}`} />
      )}
    </div>
  );
}

/**
 * An event draft as the public event page would show it, for staff. Only the
 * page's network-free parts render (the cover, the type row, the title, the
 * meta row, the description and the detail panels), inside the guest preview
 * and the staff frame, so every button answers with a toast and nothing is
 * fetched by slug: there is no RSVP, lineup, attendee list or report control
 * here. The admin page owns the `h1`, so the title is an `h2`.
 */
export function EventDraftPreview({
  preview,
  owner,
}: {
  preview: EventDraftPreviewData;
  owner: CreatorDraftOwner | null;
}) {
  const { t } = useTranslation();
  // `hostFirst` signs the access note "a note from Marta", as the published
  // page does.
  const gathering = useMemo(
    () => ({
      ...eventDraftPreviewToGatheringDetail(preview, ownerName(owner)),
      hostFirst: owner?.firstName,
    }),
    [preview, owner],
  );
  const kind = gatheringKind(gathering);
  return (
    <CreatorDraftPreviewFrame label={t("admin:creatorDrafts.preview.label")}>
      <GatheringPreviewProvider viewAs="member">
        <div className={frameStyles.eventFrame}>
          <GatheringCover gathering={gathering} />
          <div className={styles.typeRow}>
            <span className={styles.type}>
              {formatLabel(t, gathering.type)}
            </span>
            <Tag
              className={
                kind === "event" ? styles.badgeEvent : styles.badgeGathering
              }
            >
              {t(
                kind === "event"
                  ? "gatherings:gathering.badge.event"
                  : "gatherings:gathering.badge.gathering",
              )}
            </Tag>
          </div>
          <h2 className={styles.title}>
            {creatorDraftTitleText({ title: gathering.title }, t)}
          </h2>
          <EventDraftPreviewMeta gathering={gathering} preview={preview} />
          {/* Plain MentionText with no name lookup: a draft's mentions show as
            the host typed them, so opening it sends no /mentions/names request
            that would carry the draft's slugs into the logs. */}
          <p className={styles.body}>
            <MentionText text={gathering.body} linkify={false} />
          </p>
          {/* The panels fetch nothing, so demo shows the same Where and access panels as live. */}
          <GatheringDetailPanels gathering={gathering} demoMode={false} />
          <GatheringGoodToKnow gathering={gathering} />
          <GatheringTakingCare gathering={gathering} />
        </div>
      </GatheringPreviewProvider>
    </CreatorDraftPreviewFrame>
  );
}
