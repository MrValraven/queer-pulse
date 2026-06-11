import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import {
  GATHERING_DETAILS,
  GOING_ATTENDEES,
  WAITLIST_ATTENDEES,
  PREVIOUS_MESSAGES,
  GATHERING_SETTINGS,
} from "./manageGathering.data";
import styles from "./ManageGatheringPage.module.css";

type Tab = "overview" | "attendees" | "messages" | "settings";

const Pencil = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M8 1.5L10.5 4l-6 6H2V7.5l6-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 6l3 3 7-7" stroke="var(--jade)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function OverviewTab() {
  const { showToast } = useToast();
  return (
    <div>
      <div className={styles.statsRow}>
        {[["14", "Going"], ["3", "Waitlist"], ["6", "Spots left"]].map(([n, l]) => (
          <div className={styles.statChip} key={l}>
            <div className={styles.scN}>{n}</div>
            <div className={styles.scL}>{l}</div>
          </div>
        ))}
      </div>
      <div className={styles.detailBlock}>
        {GATHERING_DETAILS.map((d) => (
          <div className={styles.detailRow} key={d.label}>
            <div className={styles.drLabel}>{d.label}</div>
            <div className={styles.drVal}>{d.value}</div>
            <button type="button" className={styles.drEdit} onClick={() => showToast(`Edit ${d.label.toLowerCase()}`, "info")}>
              <Pencil /> Edit
            </button>
          </div>
        ))}
      </div>
      <div className={styles.descCard}>
        <div className={styles.descLabel}>
          Description
          <button type="button" className={styles.drEdit} onClick={() => showToast("Edit description", "info")}>
            Edit
          </button>
        </div>
        <div className={styles.descText}>
          A slow, joyful Pride-week brunch for queer Lisbon. Good food, no
          agenda, no strangers for long. We'll have the terrace to ourselves
          from 11am. Bring your people, or come solo — you'll leave with new
          ones.
        </div>
      </div>
      <div className={styles.lastEdit}>Last edited 2 days ago</div>
    </div>
  );
}

function AttendeesTab() {
  const { showToast } = useToast();
  return (
    <div>
      <div className={styles.attToolbar}>
        <input className={styles.attSearch} type="text" placeholder="Search attendees…" />
        <Button variant="ghost" className={styles.actionBtn} onClick={() => showToast("CSV exported", "success")}>
          Export list
        </Button>
      </div>
      <div className={styles.capWrap}>
        <div className={styles.capLabel}>
          <span>14 of 20 spots filled</span>
          <span className={styles.capPct}>70%</span>
        </div>
        <div className={styles.capBar}>
          <div className={styles.capFill} style={{ width: "70%" }} />
        </div>
      </div>
      <div className={styles.attSectionLabel}>Going (14)</div>
      <div className={styles.attList}>
        {GOING_ATTENDEES.map((a) => (
          <div className={styles.attRow} key={a.name}>
            <div className={styles.attAv} style={{ background: a.bg, color: a.color }}>{a.initials}</div>
            <div className={styles.attInfo}>
              <div className={styles.attName}>{a.name}</div>
              <div className={styles.attMeta}>{a.meta}</div>
            </div>
            <div className={styles.attActions}>
              <button type="button" className={`${styles.attActionBtn} ${styles.remove}`} onClick={() => showToast("Removed from guest list", "info")}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className={styles.moreRow}>+ 10 more attendees</div>
      </div>
      <div className={styles.attSectionLabel} style={{ marginTop: 20 }}>Waitlist (3)</div>
      <div className={styles.attList}>
        {WAITLIST_ATTENDEES.map((a) => (
          <div className={styles.attRow} key={a.name}>
            <div className={styles.attAv} style={{ background: a.bg, color: a.color }}>{a.initials}</div>
            <div className={styles.attInfo}>
              <div className={styles.attName}>{a.name}</div>
              <div className={styles.attMeta}>{a.meta}</div>
            </div>
            <div className={styles.attActions}>
              <button type="button" className={`${styles.attActionBtn} ${styles.promote}`} onClick={() => showToast(`${a.name.split(" ")[0]} promoted to guest list`, "success")}>
                Promote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const { showToast } = useToast();
  return (
    <div>
      <div className={styles.composerCard}>
        <div className={styles.compLabel}>Message all attendees (14 going)</div>
        <textarea className={styles.compTa} placeholder="Write an update for your guests…" />
        <div className={styles.compFooter}>
          <div className={styles.compHint}>Sent to all 14 confirmed attendees.</div>
          <Button variant="primary" onClick={() => showToast("Update sent to 14 attendees", "success")}>
            Send update
          </Button>
        </div>
      </div>
      <div className={styles.prevLabel}>Previous messages</div>
      <div className={styles.msgList}>
        {PREVIOUS_MESSAGES.map((m) => (
          <div className={styles.msgCard} key={m.subject}>
            <div className={styles.msgHeader}>
              <div className={styles.msgSubject}>{m.subject}</div>
              <div className={styles.msgTime}>{m.time}</div>
            </div>
            <div className={styles.msgPreview}>{m.preview}</div>
            <div className={styles.openRate}>
              <Check />
              {m.opened}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsTabProps {
  onCancel: () => void;
}

function SettingsTab({ onCancel }: SettingsTabProps) {
  const [toggles, setToggles] = useState<boolean[]>(GATHERING_SETTINGS.map((s) => s.on));
  return (
    <div>
      <div className={styles.sectionLabel}>Gathering options</div>
      <div className={styles.toggleList}>
        {GATHERING_SETTINGS.map((s, i) => (
          <div className={styles.tglRow} key={s.title}>
            <div>
              <div className={styles.tglTitle}>{s.title}</div>
              <div className={styles.tglDesc}>{s.desc}</div>
            </div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                checked={toggles[i]}
                onChange={() => setToggles((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
        ))}
      </div>
      <div className={styles.dangerLabel}>Danger zone</div>
      <div className={styles.dangerZone}>
        <div className={styles.dzLabel}>Cancel this gathering</div>
        <div className={styles.dzText}>
          All attendees will be notified and RSVPs will be released. This
          cannot be undone. A cancellation message will be sent automatically.
        </div>
        <Button variant="ghost" className={styles.cancelBtn} onClick={onCancel}>
          Cancel gathering
        </Button>
      </div>
    </div>
  );
}

interface ManageGatheringSidebarProps {
  onCopyLink: () => void;
}

export function ManageGatheringSidebar({ onCopyLink }: ManageGatheringSidebarProps) {
  const GATHERING = linkToPath("QueerPulse Gathering.html");
  const CONTACT = linkToPath("QueerPulse Contact.html");
  return (
    <div className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbImg}>
          <div className={styles.sbImgLabel}>
            gathering
            <br />
            cover photo
          </div>
        </div>
        <div className={styles.sbBody}>
          <div className={styles.sbTitle}>Pride Brunch — June</div>
          <div className={styles.sbMeta}>Sat 21 June · Príncipe Real</div>
          <div className={styles.shareRow}>
            <div className={styles.shareUrl}>queerpulse.com/g/pride-brunch-jun</div>
            <button type="button" className={styles.copyBtn} onClick={onCopyLink}>
              Copy
            </button>
          </div>
          <Link className={styles.sbViewLink} to={GATHERING}>
            View public listing →
          </Link>
        </div>
      </div>
      <div className={styles.supportCard}>
        <div className={styles.supText}>
          Need help with your gathering? <Link to={CONTACT}>Message the QueerPulse team →</Link>
        </div>
      </div>
    </div>
  );
}

interface ManageGatheringTabsProps {
  initialTab?: Tab;
  onCancel: () => void;
}

export function ManageGatheringTabs({ initialTab = "overview", onCancel }: ManageGatheringTabsProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div>
      <div className={styles.tabBar}>
        {(["overview", "attendees", "messages", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={[styles.tabBtn, tab === t && styles.tabBtnActive].filter(Boolean).join(" ")}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "attendees" && <AttendeesTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "settings" && <SettingsTab onCancel={onCancel} />}
    </div>
  );
}
