import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiFlag, FiMessageCircle, FiSlash, FiVolumeX } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useConnectionActions } from "./api/useConnectionActions";
import {
  profilePath,
  vouchBadgeLabel,
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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const first = name.split(" ")[0];

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
      label: "Message",
      icon: <FiMessageCircle />,
      run: () => openConnect(slug),
    },
    {
      label: `${isMuted(slug) ? "Unmute" : "Mute"} ${first}`,
      icon: <FiVolumeX />,
      run: () =>
        showToast(
          toggleMute(slug) ? `Muted ${first}` : `Unmuted ${first}`,
          "success",
        ),
    },
    {
      label: `${isBlocked(slug) ? "Unblock" : "Block"} ${first}`,
      icon: <FiSlash />,
      danger: true,
      run: () => {
        const wasBlocked = isBlocked(slug);
        void (wasBlocked ? unblock({ slug, id }) : block({ slug, id }));
        showToast(
          wasBlocked ? `Unblocked ${first}` : `Blocked ${first}`,
          "success",
        );
      },
    },
    {
      label: "Report",
      icon: <FiFlag />,
      danger: true,
      run: () => showToast(`Report sent for ${first}`, "info"),
    },
  ];

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.more}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More options for ${name}`}
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
  const to = profilePath(view.slug);
  return (
    <div className={styles.cardHead}>
      <Link
        to={to}
        aria-label={`${view.name}'s profile`}
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
          <Link to={to}>{view.name}</Link>
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
        {tags.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
      <div className={styles.tags}>
        {shown.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
        {hidden.length > 0 && (
          <span
            className={`${styles.tag} ${styles.tagMore}`}
            title={`Also: ${hidden.join(", ")}`}
          >
            +{hidden.length}
          </span>
        )}
      </div>
    </div>
  );
}

function ConnectionMeta({ view }: { view: ConnectionView }) {
  const badge = vouchBadgeLabel(view.meta);
  const { mutuals, since } = view.meta;
  return (
    <div className={styles.meta}>
      {badge && <span className={styles.vouched}>{badge}</span>}
      {mutuals != null && (
        <span>
          <b>{mutuals}</b> mutuals
        </span>
      )}
      {since && (
        <span>
          Connected <b>{since}</b>
        </span>
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
  return (
    <div
      className={[styles.card, blocked && styles.blocked]
        .filter(Boolean)
        .join(" ")}
    >
      <CardHead view={view} more />
      {blocked && <span className={styles.blockedBadge}>Blocked</span>}
      <ConnectionTags tags={view.tags} />
      <ConnectionMeta view={view} />
      <div className={styles.actions}>
        {blocked ? (
          <Button type="button" variant="ghost" onClick={onUnblock}>
            Unblock
          </Button>
        ) : (
          <>
            <Button type="button" variant="ghost" onClick={onMessage}>
              Message
            </Button>
            <Button to={profilePath(view.slug)} variant="primary">
              View profile
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
  const { mutuals, sentAgo, requestMessage } = view.meta;
  return (
    <div className={`${styles.card} ${styles.pending}`}>
      <CardHead view={view} />
      <div className={styles.meta}>
        {mutuals != null && mutuals > 0 ? (
          <span>
            <b>{mutuals}</b> mutuals
          </span>
        ) : (
          <span className={styles.metaMuted}>
            No mutuals — review carefully
          </span>
        )}
        {sentAgo && (
          <span>
            Sent <b>{sentAgo}</b>
          </span>
        )}
      </div>
      {requestMessage && <p className={styles.reqMessage}>{requestMessage}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onDecline}>
          Decline
        </Button>
        <Button type="button" variant="primary" onClick={onAccept}>
          Accept
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
  return (
    <div className={styles.card}>
      <CardHead view={view} />
      <div className={styles.meta}>
        <span className={styles.metaMuted}>
          Awaiting reply{view.meta.sentAgo ? " · sent " : ""}
          {view.meta.sentAgo && <b>{view.meta.sentAgo}</b>}
        </span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onWithdraw}>
          Withdraw
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
  return (
    <div className={`${styles.card} ${styles.blocked}`}>
      <CardHead view={view} />
      <span className={styles.blockedBadge}>Blocked</span>
      <div className={styles.meta}>
        <span className={styles.metaMuted}>
          They can't message you or see your updates.
        </span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onUnblock}>
          Unblock
        </Button>
        <Button to={profilePath(view.slug)} variant="primary">
          View profile
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
  return (
    <div className={styles.card}>
      <CardHead view={view} />
      <div className={styles.meta}>
        <span className={styles.vouched}>{note}</span>
      </div>
      <div className={styles.actions}>
        <Button to={profilePath(view.slug)} variant="primary">
          View profile
        </Button>
      </div>
    </div>
  );
}
