import { useId } from "react";
import { FiTag } from "react-icons/fi";
import {
  Badge,
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { isCommunityStaff } from "./communityStaff";
import type { CommunityRole } from "./membership.types";
import type { CommunityTagRequestDTO } from "./api/communityTagRequests.api";
import { useCommunityTagRequests } from "./api/useCommunityTagRequests";
import styles from "./CommunityTagRequestLog.module.css";

/**
 * The requester's display name, or null when the backend could not resolve the
 * profile. Null renders no byline at all rather than an invented one.
 */
function requesterName(request: CommunityTagRequestDTO): string | null {
  const requestedBy = request.requestedBy;
  if (!requestedBy) return null;
  return `${requestedBy.firstName} ${requestedBy.lastName}`.trim() || null;
}

/**
 * One suggestion: the tag asked for, where it stands, the note that came with
 * it, the dates, and who filed it.
 *
 * The status pill is amber then violet. It is deliberately never green:
 * `resolved` means an admin has READ the suggestion, and a green "done" pill
 * would say "approved and live" about a tag that does not exist and may never
 * exist.
 *
 * The requester is named on purpose. This reader is the community's own staff,
 * the person who filed it is by construction one of them (the form is
 * owner/co-owner/mod gated), and the two already know each other from the
 * roster. Without the name an owner cannot tell their own suggestion from a
 * co-moderator's, which is how the same tag gets asked for twice.
 */
function CommunityTagRequestRow({
  request,
}: {
  request: CommunityTagRequestDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const isResolved = request.status === "resolved";
  const name = requesterName(request);

  return (
    <li className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.label}>{request.label}</span>
        <Badge tone={isResolved ? "violet" : "amber"} dot>
          {t(
            isResolved
              ? "communities:edit.suggestTag.log.status.resolved"
              : "communities:edit.suggestTag.log.status.pending",
          )}
        </Badge>
      </div>

      {request.note && <p className={styles.note}>{request.note}</p>}

      <p className={styles.meta}>
        <time dateTime={request.createdAt}>
          {t("communities:edit.suggestTag.log.sentOn", {
            date: format.date(new Date(request.createdAt)),
          })}
        </time>
        {request.resolvedAt && (
          <time dateTime={request.resolvedAt}>
            {t("communities:edit.suggestTag.log.resolvedOn", {
              date: format.date(new Date(request.resolvedAt)),
            })}
          </time>
        )}
        {name && (
          <span>{t("communities:edit.suggestTag.log.sentBy", { name })}</span>
        )}
      </p>
    </li>
  );
}

/** Three placeholder rows rather than a spinner, so the panel does not jump
 *  height the moment the real ones land. Matches the mod-tools skeletons. */
function SkeletonLog() {
  return (
    <ul className={styles.rows} aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className={styles.row} aria-hidden>
          <SkeletonLine width={140} height={18} />
          <SkeletonLine width="70%" />
          <SkeletonLine width="40%" />
        </li>
      ))}
    </ul>
  );
}

/**
 * A community's own tag-suggestion log (PRD-150).
 *
 * Suggesting a tag used to be fire and forget. An owner sent "polyamory" into
 * the platform, got a toast, and then had nothing: no record that the
 * suggestion existed, no way to tell whether anybody had read it, and no way
 * to tell their own suggestion from a co-moderator's. So they filed it twice,
 * or gave up. This is the log they were missing, and it sits directly under
 * the form they file from.
 *
 * ## What it deliberately does not say
 *
 * `resolved` means somebody on the platform team has READ the suggestion. It
 * does not mean the tag exists, and it does not mean the tag will appear in
 * the picker: `COMMUNITY_TAGS` is a hardcoded, code-reviewed array by
 * deliberate product decision, and resolving a request writes to neither it
 * nor `Community.tags`. The status hint under the rows says that in plain
 * words, because a community left to guess what "resolved" meant is the whole
 * reason this surface exists. Nothing here promises a reply either: QueerPulse
 * sends no email.
 *
 * Loading, failure and an empty log are three separate renders. A failed
 * request must never paint as "nobody here has suggested a tag yet".
 */
export function CommunityTagRequestLog({
  slug,
  viewerRole,
}: {
  slug: string;
  /** The viewer's own roster role, from the community DTO's `myRole`. Owner,
   *  co-owner and moderator, matching the endpoint's guard exactly: it 403s
   *  anybody below that tier, so the request is never made for them.
   *
   *  Named `viewerRole` rather than `role`: a prop called `role` reads to
   *  `jsx-a11y/aria-role` as the DOM aria attribute at every call site, and
   *  that blocks the build at BUDGET=0. */
  viewerRole: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const isStaff = isCommunityStaff(viewerRole);
  const { data, isPending, isError, refetch } = useCommunityTagRequests(
    slug,
    isStaff,
  );

  // An ordinary member cannot reach the suggestion form in the first place, so
  // this is a second read of the same role rather than a new permission
  // source. It keeps the log off the screen of anyone the endpoint would
  // refuse, and keeps the request itself unsent for them.
  if (!isStaff) return null;

  const requests = data?.items ?? [];

  return (
    <section className={styles.log} aria-labelledby={headingId}>
      <h4 id={headingId} className={styles.title}>
        {t("communities:edit.suggestTag.log.title")}
      </h4>
      <p className={styles.sub}>{t("communities:edit.suggestTag.log.sub")}</p>

      {isPending ? (
        <SkeletonLog />
      ) : isError || !data ? (
        <LoadErrorState
          compact
          title={t("communities:edit.suggestTag.log.errorTitle")}
          onRetry={() => void refetch()}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          compact
          icon={<FiTag />}
          title={t("communities:edit.suggestTag.log.empty")}
          description={t("communities:edit.suggestTag.log.emptyHint")}
        />
      ) : (
        <>
          <ul className={styles.rows}>
            {requests.map((request) => (
              <CommunityTagRequestRow key={request.id} request={request} />
            ))}
          </ul>
          <p className={styles.hint}>
            {t("communities:edit.suggestTag.log.statusHint")}
          </p>
        </>
      )}
    </section>
  );
}
