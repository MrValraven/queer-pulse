import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button, Collapse, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffStudioRelease } from "../admin/api/useAdminStudio";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type {
  StudioReviewDisputeView,
  StudioReviewReportView,
  StudioReviewWithdrawnView,
} from "./api/studioFlagReview.adapters";
import css from "./StudioFlagReview.module.css";
import { useReviewDate } from "./useReviewDate";

export type TitleRef = (element: HTMLElement | null) => void;

/** The release a card is about, its facts and its decisions. The title
 *  takes focus when the card above it leaves. Its link opens the album
 *  route, where staff are listeners: a taken-down release shows them the
 *  withdrawn view ("Open in moderation" carries the report detail). */
export function ReviewCardFrame({
  release,
  titleRef,
  chip,
  meta,
  children,
  actions,
}: {
  release: StudioReleaseCardView | null;
  titleRef: TitleRef;
  chip?: string;
  meta: string;
  children?: ReactNode;
  actions: ReactNode;
}) {
  const { t } = useTranslation();
  const title =
    release?.title || t("studio:flagReviewLive.card.unknownRelease");
  const artistName = release?.artist.name ?? "";
  return (
    <article className={css.card}>
      <div className={css.cardTop}>
        <span className={css.cover}>
          <ImageSlot
            src={release?.coverUrl ?? undefined}
            tint={release?.tint ?? "plum"}
            width={56}
            height={56}
            radius={8}
            placeholder=""
          />
        </span>
        <div className={css.titleBlock}>
          <h3 ref={titleRef} tabIndex={-1} className={css.title}>
            {release ? <Link to={release.href}>{title}</Link> : title}
          </h3>
          {artistName.length > 0 ? (
            <p className={css.artist}>
              {t("studio:flagReviewLive.card.byArtist", { artist: artistName })}
            </p>
          ) : null}
          {chip ? <span className={css.chip}>{chip}</span> : null}
        </div>
      </div>
      {children ? <dl className={css.facts}>{children}</dl> : null}
      <p className={css.meta}>{meta}</p>
      <div className={css.actions}>{actions}</div>
    </article>
  );
}

/** One label and value on a card. With `isShown`, the fact folds in and
 *  out (a fact that only applies some of the time); without it, it always
 *  shows. */
export function ReviewFact({
  labelKey,
  children,
  isShown,
}: {
  labelKey: string;
  children: ReactNode;
  isShown?: boolean;
}) {
  const { t } = useTranslation();
  const content = (
    <>
      <dt className={css.factLabel}>{t(labelKey)}</dt>
      <dd className={css.factValue}>{children}</dd>
    </>
  );
  if (isShown === undefined) return <div className={css.fact}>{content}</div>;
  return (
    <Collapse isOpen={isShown} className={css.fact}>
      {content}
    </Collapse>
  );
}

/** A member's report. The list row carries no title, so the card reads its
 *  release through the staff release query. */
export function StudioReviewReportCard({
  report,
  titleRef,
  onTakeDown,
  onDismiss,
}: {
  report: StudioReviewReportView;
  titleRef: TitleRef;
  onTakeDown: (releaseTitle: string) => void;
  onDismiss: (releaseTitle: string) => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const release =
    useStaffStudioRelease(report.releaseId, { isSilent: true }).data ?? null;
  const releaseTitle =
    release?.title || t("studio:flagReviewLive.card.unknownRelease");
  return (
    <ReviewCardFrame
      release={release}
      titleRef={titleRef}
      chip={t(report.reasonLabelKey)}
      meta={t("studio:flagReviewLive.card.filedOn", {
        date: dateOf(report.createdAt),
      })}
      actions={
        <>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onTakeDown(releaseTitle)}
          >
            {t("studio:flagReviewLive.action.takeDown")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(releaseTitle)}
          >
            {t("studio:flagReviewLive.action.dismiss")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            to={`${routes.adminModeration}?tab=open&subjectId=${encodeURIComponent(report.releaseId)}`}
          >
            {t("studio:flagReviewLive.action.openModeration")}
          </Button>
        </>
      }
    />
  );
}

/** An artist's dispute of a takedown: the reason, their note, the date. */
export function StudioReviewDisputeCard({
  dispute,
  titleRef,
  onRestore,
  onKeepDown,
}: {
  dispute: StudioReviewDisputeView;
  titleRef: TitleRef;
  onRestore: () => void;
  onKeepDown: () => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const takedownReason = dispute.release.takedownReason;
  return (
    <ReviewCardFrame
      release={dispute.release}
      titleRef={titleRef}
      meta={t("studio:flagReviewLive.card.disputedOn", {
        date: dateOf(dispute.createdAt),
      })}
      actions={
        <>
          <Button variant="jade" size="sm" onClick={onRestore}>
            {t("studio:flagReviewLive.action.restore")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onKeepDown}>
            {t("studio:flagReviewLive.action.keepDown")}
          </Button>
        </>
      }
    >
      {takedownReason ? (
        <ReviewFact labelKey="studio:flagReviewLive.card.takedownReason">
          {takedownReason}
        </ReviewFact>
      ) : null}
      <ReviewFact labelKey="studio:flagReviewLive.card.artistNote">
        {dispute.note}
      </ReviewFact>
    </ReviewCardFrame>
  );
}

/** A release that is down: the reason, the date and "Dispute waiting" when
 *  the artist has a dispute open. */
export function StudioReviewWithdrawnCard({
  item,
  titleRef,
  onRestore,
}: {
  item: StudioReviewWithdrawnView;
  titleRef: TitleRef;
  onRestore: () => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const takedownReason = item.release.takedownReason;
  return (
    <ReviewCardFrame
      release={item.release}
      titleRef={titleRef}
      chip={
        item.openDisputeId
          ? t("studio:flagReviewLive.card.openDispute")
          : undefined
      }
      meta={t("studio:flagReviewLive.card.takenDownOn", {
        date: dateOf(item.takenDownAt),
      })}
      actions={
        <Button variant="jade" size="sm" onClick={onRestore}>
          {t("studio:flagReviewLive.action.restore")}
        </Button>
      }
    >
      {takedownReason ? (
        <ReviewFact labelKey="studio:flagReviewLive.card.takedownReason">
          {takedownReason}
        </ReviewFact>
      ) : null}
    </ReviewCardFrame>
  );
}
