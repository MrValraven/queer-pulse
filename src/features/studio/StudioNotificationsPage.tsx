import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  NOTIFICATIONS,
  FILTERS,
  type Filter,
  type NotifItem,
} from "./studioNotifications.data";
import s from "./StudioNotificationsPage.module.css";

function NotifRow({ item, unread }: { item: NotifItem; unread: boolean }) {
  const { icon } = item;
  return (
    <Link
      to={item.to}
      className={`${s.nt} ${unread ? s.unread : ""}`}
      data-t={item.type}
    >
      {icon.kind === "av" ? (
        <div className={`${s.ntIc} ${s.av} ${icon.jade ? s.jade : ""}`}>
          {icon.initials}
        </div>
      ) : (
        <div
          className={`${s.ntIc} ${icon.kind === "live" ? s.live : s.sys}`}
          aria-hidden="true"
        >
          {icon.node}
        </div>
      )}
      <div className={s.ntBody}>
        <h4>{item.title}</h4>
        {item.reply && <div className={s.reply}>{item.reply}</div>}
        <div className={s.meta}>{item.meta}</div>
        {item.action && (
          <div className={s.ntAct}>
            <span
              role="button"
              tabIndex={0}
              className={`${s.bt} ${item.type === "live" ? s.btP : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {item.action.label}
            </span>
          </div>
        )}
      </div>
      <div className={s.ntTime}>{item.time}</div>
    </Link>
  );
}

export function StudioNotificationsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [readAll, setReadAll] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: NOTIFICATIONS.length,
      reply: 0,
      release: 0,
      live: 0,
    };
    for (const n of NOTIFICATIONS) c[n.type] += 1;
    return c;
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? NOTIFICATIONS
        : NOTIFICATIONS.filter((n) => n.type === filter),
    [filter],
  );

  const isUnread = (n: NotifItem) => !readAll && n.unread;
  const grouped = filter === "all";
  const today = visible.filter((n) => n.day === "today");
  const week = visible.filter((n) => n.day === "week");

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>
            Your room · what happened while you were out
          </div>
          <h1>
            The room's been <em>busy</em>.
          </h1>
          <div className={s.dek}>
            Tip replies from artists, new releases from people you follow, live
            rooms about to open.{" "}
            <em>Only the things you asked to hear about</em> — tune it in
            Settings.
          </div>
        </div>

        <div className={s.ntWrap}>
          <div className={s.ntFilter}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${s.ntChip} ${filter === f.key ? s.on : ""}`}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label} {counts[f.key]}
              </button>
            ))}
            <button
              type="button"
              className={s.ntRead}
              onClick={() => {
                setReadAll(true);
                showToast("All caught up", "success");
              }}
            >
              Mark all read
            </button>
          </div>

          {visible.length === 0 ? (
            <div className={s.empty}>
              Nothing of <em>that kind</em> right now. When it happens, it'll
              land here. Quiet is allowed.
            </div>
          ) : grouped ? (
            <>
              {today.length > 0 && <div className={s.ntDay}>Today</div>}
              {today.map((n) => (
                <NotifRow key={n.id} item={n} unread={isUnread(n)} />
              ))}
              {week.length > 0 && <div className={s.ntDay}>This week</div>}
              {week.map((n) => (
                <NotifRow key={n.id} item={n} unread={isUnread(n)} />
              ))}
            </>
          ) : (
            visible.map((n) => (
              <NotifRow key={n.id} item={n} unread={isUnread(n)} />
            ))
          )}
        </div>
      </div>
    </StudioShell>
  );
}
