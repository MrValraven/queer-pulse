import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  DELETED,
  DURATIONS,
  PAUSE_EFFECTS,
  type LeaveState,
} from "./leave.data";
import s from "./flows.module.css";

export function LeaveConsidering({
  onPause,
  onDelete,
}: {
  onPause: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`${s.card} ${s.cardWide} ${s.screenIn}`}>
      <Link to={routes.settings} className={s.backLink}>
        ← Back to settings
      </Link>
      <div className={s.title}>
        <em>Leaving</em> QueerPulse
      </div>
      <div className={s.sub}>
        We're sorry to see you go. Before you delete your account, we want to
        make sure this is the right choice — and that you have everything you
        need.
      </div>

      <div className={s.lossCard}>
        <div className={s.lcLabel}>What gets deleted</div>
        {DELETED.map((d) => (
          <div key={d} className={s.lossItem}>
            <span className={s.lossDot} />
            {d}
          </div>
        ))}
        <div className={s.privacyNote}>
          We retain only anonymised, aggregated data. Your personal data is
          deleted within 30 days.{" "}
          <Link to={routes.safety}>Read our Privacy Policy →</Link>
        </div>
      </div>

      <div className={s.altLabel}>There might be a gentler option</div>
      <div className={s.altCard}>
        <span
          className={s.altIcon}
          style={{ background: "rgba(74,140,111,.1)" }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <circle
              cx={9}
              cy={9}
              r={6.5}
              stroke="var(--jade)"
              strokeWidth={1.6}
            />
            <path
              d="M6.5 9h5M9 6.5v5"
              stroke="var(--jade)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <div className={s.altTitle}>
            Take a break — pause for up to 6 months
          </div>
          <div className={s.altDesc}>
            Your profile goes private, you disappear from search, and no
            notifications are sent. Everything is exactly as you left it when
            you come back.
          </div>
          <Button variant="ghost" onClick={onPause}>
            Pause instead
          </Button>
        </div>
      </div>
      <div className={s.altCard}>
        <span
          className={s.altIcon}
          style={{ background: "rgba(45,27,61,.06)" }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <path
              d="M9 3v12M3 9h12"
              stroke="rgba(45,27,61,.4)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <div className={s.altTitle}>
            Step back quietly — reduce your presence
          </div>
          <div className={s.altDesc}>
            Set your profile to private, mute all notifications, and come back
            whenever you're ready. No pressure, no timer, no questions.
          </div>
          <Button variant="ghost" to={routes.settings}>
            Go quiet instead
          </Button>
        </div>
      </div>

      <div className={s.divider} />
      <div className={s.stillWant}>Still want to delete?</div>
      <textarea
        className={s.reasonTa}
        placeholder="Optional — tell us why you're leaving. We read every response."
      />
      <button type="button" className={s.deleteBtn} onClick={onDelete}>
        Delete my account
      </button>
    </div>
  );
}

export function LeavePausing({
  dur,
  onDur,
  onBack,
  onPaused,
  onDelete,
}: {
  dur: string;
  onDur: (d: string) => void;
  onBack: () => void;
  onPaused: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`${s.card} ${s.screenIn}`}>
      <button type="button" className={s.backLink} onClick={onBack}>
        ← Back
      </button>
      <div className={s.title}>
        Pausing your <em>account</em>
      </div>
      <div className={s.sub} style={{ marginBottom: 22 }}>
        Your profile goes private, you leave search results, and we stop sending
        notifications. Everything is preserved.
      </div>
      <div className={s.durOpts}>
        {DURATIONS.map((d) => (
          <div
            key={d.label}
            className={[s.durOpt, dur === d.label && s.durOptSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onDur(d.label)}
            role="radio"
            aria-checked={dur === d.label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDur(d.label);
              }
            }}
          >
            <span className={s.ocRadio}>
              <span className={s.ocDot} />
            </span>
            <div>
              <div className={s.durTitle}>{d.label}</div>
              <div className={s.durDesc}>{d.back}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.lossCard} style={{ marginBottom: 22 }}>
        <div className={s.lcLabel}>What pausing does</div>
        {PAUSE_EFFECTS.map((e) => (
          <div key={e} className={s.lossItem}>
            <span className={s.lossDot} style={{ background: "var(--jade)" }} />
            {e}
          </div>
        ))}
      </div>
      <div className={s.actions}>
        <Button onClick={onPaused}>Pause my account</Button>
        <button type="button" className={s.cancelLink} onClick={onDelete}>
          Actually, I'd rather delete →
        </button>
      </div>
    </div>
  );
}

export function LeavePaused({
  dur,
  onSettings,
}: {
  dur: string;
  onSettings: () => void;
}) {
  return (
    <div className={`${s.card} ${s.pausedCard} ${s.screenIn}`}>
      <div className={s.pausedIcon}>
        <FiCheck />
      </div>
      <div className={s.title}>
        Your account is <em>resting.</em>
      </div>
      <p className={s.pausedSub}>
        You're invisible to other members now, and we've stopped every
        notification. Your people, your badges, your history — all of it is
        exactly where you left it. Come back the moment you want to.
      </p>
      <div className={s.pausedReturn}>
        <span className={s.pausedReturnLbl}>
          You'll reactivate automatically
        </span>
        <span className={s.pausedReturnVal}>
          {DURATIONS.find((d) => d.label === dur)?.back ?? dur}
        </span>
      </div>
      <div className={s.pausedActions}>
        <Button variant="ghost-dark" to={routes.signIn}>
          Come back early →
        </Button>
        <Button variant="ghost-dark" onClick={onSettings}>
          Back to settings
        </Button>
      </div>
    </div>
  );
}

export function LeaveConfirmed() {
  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(45,27,61,.07)" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8"
            stroke="var(--plum)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d="M12 8v4.5M16 4l-1.5 4-4-1.5"
            stroke="var(--plum)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        Account deletion <em>requested</em>
      </div>
      <div className={s.sub}>
        Your account will be fully deleted within 30 days. You've been signed
        out and your profile is no longer visible.
      </div>
      <div className={s.timeline}>
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlActive}`}>1</div>
          <div className={s.tlLabel}>Request submitted</div>
        </div>
        <div className={s.tlLine} />
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlPending}`}>2</div>
          <div className={s.tlLabel}>Processing</div>
        </div>
        <div className={s.tlLine} />
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlPending}`}>3</div>
          <div className={s.tlLabel}>Deleted</div>
        </div>
      </div>
      <div className={s.reportNote} style={{ borderTop: "none" }}>
        Changed your mind? You can cancel by signing back in within 30 days.
        <br />
        <Link to={routes.signIn}>Sign in to cancel →</Link>
      </div>
    </div>
  );
}

export type { LeaveState };
