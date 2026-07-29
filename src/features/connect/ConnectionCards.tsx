import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiFlag, FiMessageCircle, FiSlash, FiVolumeX } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/useConnect";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useConnectionActions } from "./api/useConnectionActions";
import { reasonLabel } from "./connectModal.data";
import {
  profilePath,
  vouchBadgeLabelKey,
  type ConnectionView,
} from "./connections.data";
import styles from "./ConnectionsPage.module.css";

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

/** Keyboard-accessible per-connection menu: Message / Mute / Block / Report. */
function ConnectionMoreMenu({
  slug,
  id,
  name,
}: {
  slug: string;
  /** Backend connection id (live mode); absent in demo. */
  id?: string;
  name: string;
}) {
  const { openConnect } = useConnect();
  const { isBlocked, isMuted, toggleMute } = useSocial();
  const { block, unblock } = useConnectionActions();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const first = name.split(" ")[0]!;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: {
    label: string;
    icon: React.ReactNode;
    danger?: boolean;
    run: () => void;
  }[] = [
    {
      label: t("connect:moreMenu.message"),
      icon: <FiMessageCircle />,
      run: () => openConnect(slug),
    },
    {
      label: isMuted(slug)
        ? t("connect:moreMenu.unmute", { name: first })
        : t("connect:moreMenu.mute", { name: first }),
      icon: <FiVolumeX />,
      run: () =>
        showToast(
          toggleMute(slug)
            ? t("connect:moreMenu.toastMuted", { name: first })
            : t("connect:moreMenu.toastUnmuted", { name: first }),
          "success",
        ),
    },
    {
      label: isBlocked(slug)
        ? t("connect:moreMenu.unblock", { name: first })
        : t("connect:moreMenu.block", { name: first }),
      icon: <FiSlash />,
      danger: true,
      run: () => {
        const wasBlocked = isBlocked(slug);
        void (wasBlocked ? unblock({ slug, id }) : block({ slug, id }));
        showToast(
          wasBlocked
            ? t("connect:moreMenu.toastUnblocked", { name: first })
            : t("connect:moreMenu.toastBlocked", { name: first }),
          "success",
        );
      },
    },
    {
      label: t("connect:moreMenu.report"),
      icon: <FiFlag />,
      danger: true,
      run: () =>
        showToast(
          t("connect:moreMenu.toastReportSent", { name: first }),
          "info",
        ),
    },
  ];

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.more}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("connect:moreMenu.ariaMore", { name })}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={[styles.menuItem, item.danger && styles.menuDanger]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setOpen(false);
                item.run();
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CardHead({
  view,
  more,
}: {
  view: ConnectionView;
  more?: boolean;
}) {
  const { t } = useTranslation();
  const to = profilePath(view.slug);
  return (
    <div className={styles.cardHead}>
      <Link
        to={to}
        aria-label={t("connect:card.profileAria", { name: view.name })}
        className={styles.avLink}
      >
        <Avatar
          initials={view.initials}
          tint={view.tint}
          src={view.photo}
          size={54}
          alt={view.name}
        />
      </Link>
      <div>
        <div className={styles.name}>
          <span className={styles.nameRow}>
            <Link to={to}>{view.name}</Link>
            <MemberStaffBadge slug={view.slug} />
          </span>
        </div>
        {view.pron && <div className={styles.pron}>{view.pron}</div>}
        <div className={styles.role}>{view.role}</div>
      </div>
      {more && (
        <ConnectionMoreMenu
          slug={view.slug}
          id={view.meta.id}
          name={view.name}
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
      {mutuals != null && (
        <span>{t("connect:card.mutuals", { count: mutuals })}</span>
      )}
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
      <CardHead view={view} more />
      {blocked && (
        <span className={styles.blockedBadge}>
          {t("connect:card.blockedBadge")}
        </span>
      )}
      <ConnectionTags tags={view.tags} />
      <ConnectionMeta view={view} />
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
      <CardHead view={view} />
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
      <CardHead view={view} />
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
