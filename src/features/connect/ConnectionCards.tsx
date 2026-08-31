import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { reasonLabel } from "./connectModal.data";
import { ConnectionMoreMenu } from "./ConnectionMoreMenu";
import { ConnectionNoteEditor } from "./ConnectionNoteEditor";
import {
  profilePath,
  vouchBadgeLabelKey,
  type ConnectionView,
} from "./connections.data";
import styles from "./ConnectionsPage.module.css";

export function CardHead({
  view,
  more,
  onMessage,
}: {
  view: ConnectionView;
  more?: boolean;
  /** Opens the conversation from the kebab; omit where messaging isn't apt. */
  onMessage?: () => void;
}) {
  // Staff role is resolved from the shared roster map (same source the message
  // picker uses); MemberIdentity renders the StaffBadge from it.
  const staffMap = useStaffMap();
  const secondary = [view.pron, view.role].filter(Boolean).join(" · ");
  return (
    <div className={styles.cardHead}>
      <MemberIdentity
        person={{
          slug: view.slug,
          name: view.name,
          avatarUrl: view.photo,
          staffRole: staffMap[view.slug]?.tier ?? undefined,
          staffBadgedRoles: staffMap[view.slug]?.badgedStaffRoles,
        }}
        secondary={secondary}
        to={profilePath(view.slug)}
        size={54}
      />
      {more && (
        <ConnectionMoreMenu
          slug={view.slug}
          id={view.meta.id}
          name={view.name}
          onMessage={onMessage}
        />
      )}
    </div>
  );
}

/**
 * Tags clamped to two lines. Anything that would spill onto a third line is
 * folded into a "+N" pill so the user knows there's more. A hidden row that
 * always holds the full list is measured (distinct offsetTop = line count) by a
 * ResizeObserver, which also fires on mount and on any grid reflow — so the
 * visible count is computed in a single pass without a setState-in-effect loop.
 */
function ConnectionTags({ tags }: { tags: string[] }) {
  const { t } = useTranslation();
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(tags.length);

  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const children = Array.from(el.children) as HTMLElement[];
      const lineTops: number[] = [];
      for (const c of children) {
        if (!lineTops.includes(c.offsetTop)) lineTops.push(c.offsetTop);
      }
      if (lineTops.length <= 2) {
        setVisible(tags.length);
        return;
      }
      // Chips on lines 1–2, minus one slot reserved for the "+N" pill.
      const fit = children.filter((c) => c.offsetTop <= lineTops[1]!).length;
      setVisible(Math.max(1, fit - 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tags]);

  if (tags.length === 0) return null;
  const shown = tags.slice(0, visible);
  const hidden = tags.slice(visible);

  return (
    <div className={styles.tagsWrap}>
      <div className={styles.tagsMeasure} aria-hidden ref={measureRef}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.tags}>
        {shown.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
        {hidden.length > 0 && (
          <span
            className={`${styles.tag} ${styles.tagMore}`}
            title={t("connect:card.tagsMoreTitle", { list: hidden.join(", ") })}
          >
            +{hidden.length}
          </span>
        )}
      </div>
    </div>
  );
}

function ConnectionMeta({ view }: { view: ConnectionView }) {
  const { t } = useTranslation();
  const badgeKey = vouchBadgeLabelKey(view.meta);
  const { mutuals, since } = view.meta;
  return (
    <div className={styles.meta}>
      {badgeKey && <span className={styles.vouched}>{t(badgeKey)}</span>}
      {mutuals != null &&
        (mutuals > 0 ? (
          <Translation
            i18nKey="connect:card.mutuals"
            components={{ b: <b /> }}
            values={{ count: mutuals }}
          />
        ) : (
          <span className={styles.metaMuted}>
            {t("connect:card.noMutuals")}
          </span>
        ))}
      {since && (
        <Translation
          i18nKey="connect:card.connectedSince"
          components={{ b: <b /> }}
          values={{ since }}
        />
      )}
    </div>
  );
}

/**
 * Why this person reached out, shown back on the connection it became.
 *
 * The reason was captured when the request was sent and then disappeared the
 * moment it was accepted, which is exactly when a member starts needing it:
 * "who is this again?" is answered by "they wrote to you about the choir".
 * `isRequestedByYou` decides the wording, since after acceptance both sides
 * read as simply connected.
 */
function AcceptedRequestReason({ view }: { view: ConnectionView }) {
  const { t } = useTranslation();
  const reason = reasonLabel(view.meta.requestReason, t);
  if (!reason) return null;
  return (
    <p className={styles.reqReason}>
      <Translation
        i18nKey={
          view.meta.isRequestedByYou
            ? "connect:card.reasonYouAsked"
            : "connect:card.reasonTheyAsked"
        }
        components={{ b: <b /> }}
        values={{ reason, name: view.name.split(" ")[0] ?? view.name }}
      />
    </p>
  );
}

export function AllConnectionCard({
  view,
  blocked,
  onUnblock,
  onMessage,
}: {
  view: ConnectionView;
  blocked: boolean;
  onUnblock: () => void;
  onMessage: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={[styles.card, blocked && styles.blocked]
        .filter(Boolean)
        .join(" ")}
    >
      <CardHead view={view} more onMessage={onMessage} />
      {blocked && (
        <span className={styles.blockedBadge}>
          {t("connect:card.blockedBadge")}
        </span>
      )}
      <ConnectionTags tags={view.tags} />
      <ConnectionMeta view={view} />
      {!blocked && (
        <>
          <AcceptedRequestReason view={view} />
          {/* The member's own private jotting. Never visible to the other
              party: the server only reads a note back under its author. */}
          <ConnectionNoteEditor view={view} />
        </>
      )}
      <div className={styles.actions}>
        {blocked ? (
          <Button type="button" variant="ghost" onClick={onUnblock}>
            {t("connect:card.unblock")}
          </Button>
        ) : (
          <>
            <Button type="button" variant="ghost" onClick={onMessage}>
              {t("connect:card.message")}
            </Button>
            <Button to={profilePath(view.slug)} variant="primary">
              {t("connect:card.viewProfile")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function IncomingCard({
  view,
  onAccept,
  onDecline,
}: {
  view: ConnectionView;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const { mutuals, sentAgo, requestMessage, requestReason, introducedBy } =
    view.meta;
  const reason = reasonLabel(requestReason, t);
  return (
    <div className={`${styles.card} ${styles.pending}`}>
      {/* The kebab carries Mute / Block / Report. Without it a member had to
          accept an unwanted request just to reach those actions. No Message
          item here: the conversation only opens once the request is accepted. */}
      <CardHead view={view} more />
      {introducedBy && (
        <p className={styles.introBy}>
          <Translation
            i18nKey="connect:card.introducedBy"
            components={{ a: <Link to={profilePath(introducedBy.slug)} /> }}
            values={{ name: introducedBy.name }}
          />
        </p>
      )}
      <div className={styles.meta}>
        {mutuals != null && mutuals > 0 ? (
          <Translation
            i18nKey="connect:card.mutuals"
            components={{ b: <b /> }}
            values={{ count: mutuals }}
          />
        ) : (
          <span className={styles.metaMuted}>
            {t("connect:card.noMutuals")}
          </span>
        )}
        {sentAgo && (
          <Translation
            i18nKey="connect:card.sentAgo"
            components={{ b: <b /> }}
            values={{ sentAgo }}
          />
        )}
      </div>
      {reason && (
        <p className={styles.reqReason}>
          <Translation
            i18nKey="connect:card.reason"
            components={{ b: <b /> }}
            values={{ reason }}
          />
        </p>
      )}
      {requestMessage && <p className={styles.reqMessage}>{requestMessage}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onDecline}>
          {t("connect:card.decline")}
        </Button>
        <Button type="button" variant="primary" onClick={onAccept}>
          {t("connect:card.accept")}
        </Button>
      </div>
    </div>
  );
}

export function SentCard({
  view,
  onWithdraw,
}: {
  view: ConnectionView;
  onWithdraw: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <CardHead view={view} more />
      <div className={styles.meta}>
        <span className={styles.metaMuted}>
          {view.meta.sentAgo ? (
            <Translation
              i18nKey="connect:card.awaitingReplySince"
              components={{ b: <b /> }}
              values={{ sentAgo: view.meta.sentAgo }}
            />
          ) : (
            t("connect:card.awaitingReply")
          )}
        </span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onWithdraw}>
          {t("connect:card.withdraw")}
        </Button>
      </div>
    </div>
  );
}

export function BlockedCard({
  view,
  onUnblock,
}: {
  view: ConnectionView;
  onUnblock: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.card} ${styles.blocked}`}>
      <CardHead view={view} />
      <span className={styles.blockedBadge}>
        {t("connect:card.blockedBadge")}
      </span>
      <div className={styles.meta}>
        <span className={styles.metaMuted}>
          {t("connect:card.cantMessage")}
        </span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onUnblock}>
          {t("connect:card.unblock")}
        </Button>
        <Button to={profilePath(view.slug)} variant="primary">
          {t("connect:card.viewProfile")}
        </Button>
      </div>
    </div>
  );
}

export function VouchedCard({
  view,
  note,
}: {
  view: ConnectionView;
  note: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <CardHead view={view} />
      <div className={styles.meta}>
        <span className={styles.vouched}>{note}</span>
      </div>
      <div className={styles.actions}>
        <Button to={profilePath(view.slug)} variant="primary">
          {t("connect:card.viewProfile")}
        </Button>
      </div>
    </div>
  );
}
