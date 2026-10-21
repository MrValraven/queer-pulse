import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  NOTIFICATIONS,
  FILTERS,
  type Filter,
  type NotifItem,
  notifValues,
} from "./studioNotifications.data";
import s from "./StudioNotificationsPage.module.css";

/** Tag runs a notification title may carry. */
const TITLE_TAGS = { strong: <strong />, em: <em /> };

function NotifRow({ item, unread }: { item: NotifItem; unread: boolean }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { icon } = item;
  // The row is a card: the main area is the link and the action
  // is a real sibling button, so no control sits inside another.
  return (
    <div className={`${s.nt} ${unread ? s.unread : ""}`} data-t={item.type}>
      <Link to={item.to} className={s.ntLink}>
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
          <h4>
            <Translation
              i18nKey={item.title.key}
              values={notifValues(item.title, fmt)}
              components={TITLE_TAGS}
            />
          </h4>
          {item.replyKey && <div className={s.reply}>{t(item.replyKey)}</div>}
          <div className={s.meta}>
            {t(item.meta.key, notifValues(item.meta, fmt))}
          </div>
        </div>
        <div className={s.ntTime}>{t(item.time.key, item.time.values)}</div>
      </Link>
      {item.action && (
        <div className={s.ntAct}>
          {item.type === "live" ? (
            <Button to={item.to} variant="primary" size="sm">
              {t(item.action.labelKey)}
            </Button>
          ) : (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => showToast(t("studio:notifications.rsvpToast"))}
            >
              {t(item.action.labelKey)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function StudioNotificationsPage() {
  const { t } = useTranslation();
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
          <div className={s.eb}>{t("studio:notifications.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:notifications.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>
            <Translation
              i18nKey="studio:notifications.dek"
              components={{ em: <em /> }}
            />
          </div>
        </div>

        <div className={s.ntWrap}>
          <div className={s.ntFilter}>
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "primary" : "quiet"}
                size="sm"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {t(f.labelKey)} {counts[f.key]}
              </Button>
            ))}
            <Button
              variant="quiet"
              size="sm"
              className={s.ntRead}
              onClick={() => {
                setReadAll(true);
                showToast(
                  t("studio:notifications.markAllReadToast"),
                  "success",
                );
              }}
            >
              {t("studio:notifications.markAllReadCta")}
            </Button>
          </div>

          {visible.length === 0 ? (
            <div className={s.empty}>
              <Translation
                i18nKey="studio:notifications.empty"
                components={{ em: <em /> }}
              />
            </div>
          ) : grouped ? (
            <>
              {today.length > 0 && (
                <div className={s.ntDay}>
                  {t("studio:notifications.day.today")}
                </div>
              )}
              {today.map((n) => (
                <NotifRow key={n.id} item={n} unread={isUnread(n)} />
              ))}
              {week.length > 0 && (
                <div className={s.ntDay}>
                  {t("studio:notifications.day.week")}
                </div>
              )}
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
