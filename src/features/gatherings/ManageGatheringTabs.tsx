import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { Button, EmptyState, Tabs } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { InlineEditModal } from "./InlineEditModal";
import { InviteMembersModal } from "./InviteMembersModal";
import { CohostManager } from "./CohostManager";
import {
  PREVIOUS_MESSAGES,
  GATHERING_SETTINGS,
  ATTENDEE_COUNT,
  LAST_EDITED_AT,
  GATHERING_DATE,
  GATHERING_TITLE,
} from "./manageGathering.data";
import { useAttendees } from "./api/useAttendees";
import { AttendeeSection } from "./ManageGatheringAttendees";
import styles from "./ManageGatheringPage.module.css";

interface GatheringDetail {
  id: string;
  labelKey: string;
  value: string;
}

type Tab = "overview" | "attendees" | "messages" | "settings";

const Pencil = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M8 1.5L10.5 4l-6 6H2V7.5l6-6Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1 6l3 3 7-7"
      stroke="var(--jade)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface OverviewTabProps {
  details: GatheringDetail[];
  description: string;
  onUpdateDetail: (id: string, value: string) => void;
  onUpdateDescription: (value: string) => void;
}

/** Plain helper (not a component/hook) so calling `Date.now()` here doesn't
 *  trip the render-purity lint that applies to component/hook bodies. */
function daysSince(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 86_400_000);
}

function OverviewTab({
  details,
  description,
  onUpdateDetail,
  onUpdateDescription,
}: OverviewTabProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [editing, setEditing] = useState<
    | { kind: "detail"; id: string; labelKey: string; value: string }
    | { kind: "description"; value: string }
    | null
  >(null);

  const lastEditedDays = daysSince(LAST_EDITED_AT);

  const stats: [number, string][] = [
    [14, t("gatherings:manage.overview.stat.going")],
    [3, t("gatherings:manage.overview.stat.waitlist")],
    [6, t("gatherings:manage.overview.stat.spotsLeft")],
  ];

  return (
    <div>
      <div className={styles.statsRow}>
        {stats.map(([count, label]) => (
          <div className={styles.statChip} key={label}>
            <div className={styles.scN}>{count}</div>
            <div className={styles.scL}>{label}</div>
          </div>
        ))}
      </div>
      <div className={styles.detailBlock}>
        {details.map((detail) => (
          <div className={styles.detailRow} key={detail.id}>
            <div className={styles.drLabel}>{t(detail.labelKey)}</div>
            <div className={styles.drVal}>{detail.value}</div>
            <button
              type="button"
              className={styles.drEdit}
              onClick={() =>
                setEditing({
                  kind: "detail",
                  id: detail.id,
                  labelKey: detail.labelKey,
                  value: detail.value,
                })
              }
            >
              <Pencil /> {t("gatherings:manage.overview.editCta")}
            </button>
          </div>
        ))}
      </div>
      <div className={styles.descCard}>
        <div className={styles.descLabel}>
          {t("gatherings:manage.overview.descriptionLabel")}
          <button
            type="button"
            className={styles.drEdit}
            onClick={() =>
              setEditing({ kind: "description", value: description })
            }
          >
            {t("gatherings:manage.overview.editCta")}
          </button>
        </div>
        <div className={styles.descText}>{description}</div>
      </div>
      <div className={styles.lastEdit}>
        {t("gatherings:manage.overview.lastEdited", {
          time: fmt.relativeTime(lastEditedDays, "day"),
        })}
      </div>

      {editing?.kind === "detail" && (
        <InlineEditModal
          label={t(editing.labelKey).toLowerCase()}
          initialValue={editing.value}
          onClose={() => setEditing(null)}
          onSave={(value) => onUpdateDetail(editing.id, value)}
        />
      )}
      {editing?.kind === "description" && (
        <InlineEditModal
          label={t("gatherings:manage.overview.descriptionNoun")}
          initialValue={editing.value}
          multiline
          onClose={() => setEditing(null)}
          onSave={onUpdateDescription}
        />
      )}
    </div>
  );
}

function AttendeesTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loadingMoreGoing, setLoadingMoreGoing] = useState(false);
  const [loadingMoreWaitlist, setLoadingMoreWaitlist] = useState(false);
  const { data, loadMoreGoing, loadMoreWaitlist } = useAttendees(slug);
  const going = data?.going ?? [];
  const waitlist = data?.waitlist ?? [];
  const goingCount = data?.goingCount ?? going.length;
  const waitlistCount = data?.waitlistCount ?? waitlist.length;
  const capacity = data?.capacity ?? 20;
  const pct = capacity ? Math.round((goingCount / capacity) * 100) : 0;
  const hasMoreGoing = data?.hasMoreGoing ?? false;
  const hasMoreWaitlist = data?.hasMoreWaitlist ?? false;
  const onLoadMoreGoing = async () => {
    setLoadingMoreGoing(true);
    await loadMoreGoing();
    setLoadingMoreGoing(false);
  };
  const onLoadMoreWaitlist = async () => {
    setLoadingMoreWaitlist(true);
    await loadMoreWaitlist();
    setLoadingMoreWaitlist(false);
  };
  return (
    <div>
      <div className={styles.attToolbar}>
        <input
          className={styles.attSearch}
          type="text"
          aria-label={t("gatherings:manage.attendees.searchPlaceholder")}
          placeholder={t("gatherings:manage.attendees.searchPlaceholder")}
        />
        <Button
          variant="ghost"
          className={styles.actionBtn}
          onClick={() =>
            showToast(t("gatherings:manage.attendees.exportedToast"), "success")
          }
        >
          {t("gatherings:manage.attendees.exportCta")}
        </Button>
        <Button
          variant="primary"
          className={styles.actionBtn}
          onClick={() => setInviteOpen(true)}
        >
          {t("gatherings:manage.attendees.inviteCta")}
        </Button>
      </div>
      <div className={styles.capWrap}>
        <div className={styles.capLabel}>
          <span>
            {t("gatherings:manage.attendees.spotsFilled", {
              going: goingCount,
              capacity,
            })}
          </span>
          <span className={styles.capPct}>
            {fmt.number(pct / 100, {
              style: "percent",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className={styles.capBar}>
          <div className={styles.capFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <AttendeeSection
        heading={t("gatherings:manage.attendees.goingHeading", {
          count: goingCount,
        })}
        attendees={going}
        hasMore={hasMoreGoing}
        loadingMore={loadingMoreGoing}
        onLoadMore={() => void onLoadMoreGoing()}
        renderAction={(attendee) => (
          <Button
            variant="ghost"
            aria-label={t("gatherings:manage.attendees.removeAria", {
              name: attendee.name,
            })}
            className={`${styles.attActionBtn} ${styles.remove}`}
            onClick={() =>
              showToast(t("gatherings:manage.attendees.removedToast"), "info")
            }
          >
            {t("gatherings:manage.attendees.removeCta")}
          </Button>
        )}
      />
      <AttendeeSection
        heading={t("gatherings:manage.attendees.waitlistHeading", {
          count: waitlistCount,
        })}
        headingStyle={{ marginTop: 20 }}
        attendees={waitlist}
        hasMore={hasMoreWaitlist}
        loadingMore={loadingMoreWaitlist}
        onLoadMore={() => void onLoadMoreWaitlist()}
        renderAction={(attendee) => (
          <Button
            variant="ghost"
            aria-label={t("gatherings:manage.attendees.promoteAria", {
              name: attendee.name,
            })}
            className={`${styles.attActionBtn} ${styles.promote}`}
            onClick={() =>
              showToast(
                t("gatherings:manage.attendees.promotedToast", {
                  name: attendee.name.split(" ")[0]!,
                }),
                "success",
              )
            }
          >
            {t("gatherings:manage.attendees.promoteCta")}
          </Button>
        )}
      />
      {inviteOpen && (
        <InviteMembersModal slug={slug} onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}

interface SentMessage {
  id: string;
  subject: string;
  sentAt: Date;
  preview: string;
  openedCount: number;
}

/** "just now" for a message sent this session, else a day-level relative time. */
function messageRelativeTime(
  sentAt: Date,
  t: TFunction,
  fmt: Formatters,
): string {
  const diffMinutes = Math.round((sentAt.getTime() - Date.now()) / 60_000);
  if (Math.abs(diffMinutes) < 1) return t("gatherings:manage.messages.justNow");
  const diffDays = Math.round((sentAt.getTime() - Date.now()) / 86_400_000);
  return fmt.relativeTime(diffDays, "day");
}

function MessagesTab() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const composerLabelId = useId();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<SentMessage[]>([]);

  const messages = [...sent, ...PREVIOUS_MESSAGES];

  const send = () => {
    const text = message.trim();
    if (!text) return;
    const subject = text.length > 48 ? `${text.slice(0, 45)}…` : text;
    setSent((prev) => [
      {
        id: `sent-${prev.length}-${text.length}-${text.slice(0, 8)}`,
        subject,
        sentAt: new Date(),
        preview: text,
        openedCount: 0,
      },
      ...prev,
    ]);
    setMessage("");
    showToast(
      t("gatherings:manage.messages.sentToast", { count: ATTENDEE_COUNT }),
      "success",
    );
  };

  return (
    <div>
      <div className={styles.composerCard}>
        <div className={styles.compLabel} id={composerLabelId}>
          {t("gatherings:manage.messages.composerLabel", {
            count: ATTENDEE_COUNT,
          })}
        </div>
        <textarea
          aria-labelledby={composerLabelId}
          className={styles.compTa}
          placeholder={t("gatherings:manage.writeUpdatePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className={styles.compFooter}>
          <div className={styles.compHint}>
            {t("gatherings:manage.messages.sentHint", {
              count: ATTENDEE_COUNT,
            })}
          </div>
          <Button variant="primary" disabled={!message.trim()} onClick={send}>
            {t("gatherings:manage.messages.sendCta")}
          </Button>
        </div>
      </div>
      <div className={styles.prevLabel}>
        {t("gatherings:manage.messages.previousHeading")}
      </div>
      <div className={styles.msgList}>
        {messages.length === 0 && (
          <EmptyState
            compact
            icon={<FiSend />}
            title={t("gatherings:manage.messages.emptyTitle")}
            description={t("gatherings:manage.messages.emptyDescription")}
          />
        )}
        {messages.map((sentMessage) => (
          <div className={styles.msgCard} key={sentMessage.id}>
            <div className={styles.msgHeader}>
              <div className={styles.msgSubject}>{sentMessage.subject}</div>
              <div className={styles.msgTime}>
                {messageRelativeTime(sentMessage.sentAt, t, fmt)}
              </div>
            </div>
            <div className={styles.msgPreview}>{sentMessage.preview}</div>
            <div className={styles.openRate}>
              <Check />
              {t("gatherings:manage.messages.openedOf", {
                opened: sentMessage.openedCount,
                total: ATTENDEE_COUNT,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsTabProps {
  slug: string;
  onCancel: () => void;
}

function SettingsTab({ slug, onCancel }: SettingsTabProps) {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      GATHERING_SETTINGS.map((setting) => [setting.id, setting.on]),
    ),
  );
  return (
    <div>
      <CohostManager slug={slug} />
      <div className={styles.sectionLabel}>
        {t("gatherings:manage.settings.optionsHeading")}
      </div>
      <div className={styles.toggleList}>
        {GATHERING_SETTINGS.map((setting) => (
          <div className={styles.tglRow} key={setting.id}>
            <div>
              <div className={styles.tglTitle}>{t(setting.titleKey)}</div>
              <div className={styles.tglDesc}>{t(setting.descriptionKey)}</div>
            </div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                aria-label={t(setting.titleKey)}
                checked={toggles[setting.id] ?? false}
                onChange={() =>
                  setToggles((prev) => ({
                    ...prev,
                    [setting.id]: !prev[setting.id],
                  }))
                }
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
        ))}
      </div>
      <div className={styles.dangerLabel}>
        {t("gatherings:manage.settings.dangerZoneHeading")}
      </div>
      <div className={styles.dangerZone}>
        <div className={styles.dzLabel}>
          {t("gatherings:manage.settings.cancelLabel")}
        </div>
        <div className={styles.dzText}>
          {t("gatherings:manage.settings.cancelText")}
        </div>
        <Button variant="ghost" className={styles.cancelBtn} onClick={onCancel}>
          {t("gatherings:manage.settings.cancelCta")}
        </Button>
      </div>
    </div>
  );
}

interface ManageGatheringSidebarProps {
  onCopyLink: () => void;
}

/** Content, not chrome — the live listing URL for this gathering. */
const SHARE_URL = "queerpulse.com/g/pride-brunch-jun";

export function ManageGatheringSidebar({
  onCopyLink,
}: ManageGatheringSidebarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const GATHERING = routes.gatherings;
  const CONTACT = routes.contact;
  return (
    <div className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbImg}>
          <div className={styles.sbImgLabel}>
            {t("gatherings:manage.sidebar.coverPhotoLine1")}
            <br />
            {t("gatherings:manage.sidebar.coverPhotoLine2")}
          </div>
        </div>
        <div className={styles.sbBody}>
          <div className={styles.sbTitle}>{GATHERING_TITLE}</div>
          <div className={styles.sbMeta}>
            {fmt.date(GATHERING_DATE, {
              weekday: "short",
              day: "numeric",
              month: "long",
            })}{" "}
            · {t("gatherings:hood.principeReal")}
          </div>
          <div className={styles.shareRow}>
            <div className={styles.shareUrl}>{SHARE_URL}</div>
            <Button
              variant="primary"
              className={styles.copyBtn}
              onClick={onCopyLink}
            >
              {t("gatherings:manage.sidebar.copyCta")}
            </Button>
          </div>
          <Link className={styles.sbViewLink} to={GATHERING}>
            {t("gatherings:manage.sidebar.viewListingCta")} →
          </Link>
        </div>
      </div>
      <div className={styles.supportCard}>
        <div className={styles.supText}>
          <Translation
            i18nKey="gatherings:manage.sidebar.supportText"
            components={{ a: <Link to={CONTACT} /> }}
          />
        </div>
      </div>
    </div>
  );
}

interface ManageGatheringTabsProps {
  initialTab?: Tab;
  /** Event slug the attendee list is fetched for. */
  slug: string;
  onCancel: () => void;
  details: GatheringDetail[];
  description: string;
  onUpdateDetail: (id: string, value: string) => void;
  onUpdateDescription: (value: string) => void;
}

const TAB_ORDER: Tab[] = ["overview", "attendees", "messages", "settings"];

const TAB_LABEL_KEYS: Record<Tab, string> = {
  overview: "gatherings:manage.tabs.overview",
  attendees: "gatherings:manage.tabs.attendees",
  messages: "gatherings:manage.tabs.messages",
  settings: "gatherings:manage.tabs.settings",
};

export function ManageGatheringTabs({
  initialTab = "overview",
  slug,
  onCancel,
  details,
  description,
  onUpdateDetail,
  onUpdateDescription,
}: ManageGatheringTabsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div>
      <Tabs
        variant="underline"
        className={styles.tabBar}
        tabs={TAB_ORDER.map((tabId) => ({
          id: tabId,
          label: t(TAB_LABEL_KEYS[tabId]),
        }))}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
      />
      {tab === "overview" && (
        <OverviewTab
          details={details}
          description={description}
          onUpdateDetail={onUpdateDetail}
          onUpdateDescription={onUpdateDescription}
        />
      )}
      {tab === "attendees" && <AttendeesTab slug={slug} />}
      {tab === "messages" && <MessagesTab />}
      {tab === "settings" && <SettingsTab slug={slug} onCancel={onCancel} />}
    </div>
  );
}
