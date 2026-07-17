import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import {
  CONNECTION,
  GATHERING,
  REPLY,
  MENTION,
  MODERATION,
  type AvTint,
} from "./notificationDeepLink.data";
import styles from "./NotificationDeepLinkPage.module.css";

interface SentReply {
  id: string;
  body: string;
}

const avClass: Record<AvTint, string | undefined> = {
  jade: styles.avJade,
  coral: styles.avCoral,
  plum: styles.avPlum,
};

function MemberMini({
  initials,
  tint,
  name,
  meta,
}: {
  initials: string;
  tint: AvTint;
  name: string;
  meta: string;
}) {
  return (
    <div className={styles.memberMini}>
      <div className={`${styles.mmAv} ${avClass[tint]}`}>{initials}</div>
      <div>
        <div className={styles.mmName}>{name}</div>
        <div className={styles.mmMeta}>{meta}</div>
      </div>
    </div>
  );
}

function Composer({
  initials,
  replyToName,
  onSend,
}: {
  initials: string;
  replyToName: string;
  onSend: (body: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  function submit() {
    const body = value.trim();
    if (!body) return;
    onSend(body);
    setValue("");
  }
  return (
    <div className={styles.composer}>
      <div className={styles.rcAv}>{initials}</div>
      <textarea
        className={styles.rcInput}
        rows={1}
        placeholder={t("notifications:deepLink.composer.placeholder", {
          name: replyToName,
        })}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button type="button" className={styles.rcSend} onClick={submit}>
        {t("notifications:deepLink.composer.send")}
      </button>
    </div>
  );
}

/** Renders the replies the user has sent this session, in the same bubble style. */
function SentReplies({ replies }: { replies: SentReply[] }) {
  const { t } = useTranslation();
  if (replies.length === 0) return null;
  return (
    <>
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={styles.replyBubble}
          style={{ marginTop: 12 }}
        >
          <div className={styles.rbHeader}>
            <div className={styles.rbAv}>YO</div>
            <div className={styles.rbName}>
              {t("notifications:deepLink.sentReply.you")}
            </div>
            <div className={styles.rbTime}>
              {t("notifications:deepLink.sentReply.justNow")}
            </div>
          </div>
          <div className={styles.rbText}>{reply.body}</div>
        </div>
      ))}
    </>
  );
}

export function ConnectionCard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const c = CONNECTION;
  const firstName = c.name.split(" ")[0];
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    "pending",
  );

  function accept() {
    setStatus("accepted");
    showToast(
      t("notifications:deepLink.connection.toastConnected", {
        name: firstName,
      }),
      "success",
    );
  }
  function decline() {
    setStatus("declined");
    showToast(t("notifications:deepLink.connection.toastDeclined"), "info");
  }

  // Decline collapses the card away.
  if (status === "declined") {
    return <div className={styles.cardCollapse} aria-hidden />;
  }

  // Accept flips to the plum-panel success state.
  if (status === "accepted") {
    return (
      <div
        className={`${styles.card} ${styles.cardPad} ${styles.connDone}`}
        role="status"
      >
        <div className={styles.connDoneIcon}>
          <FiCheck aria-hidden />
        </div>
        <div className={styles.connDoneTitle}>
          <Translation
            i18nKey="notifications:deepLink.connection.connectedTitle"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.connDoneBody}>
          {t("notifications:deepLink.connection.connectedBody", {
            name: firstName,
          })}
        </p>
        <div className={styles.connDoneActions}>
          <Button
            variant="ghost-dark"
            onClick={() => navigate(routes.connections)}
          >
            {t("notifications:deepLink.connection.viewConnections")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini
        initials={c.initials}
        tint={c.tint}
        name={c.name}
        meta={c.meta}
      />
      <div className={styles.connHead}>
        <Translation
          i18nKey="notifications:deepLink.connection.wantsToConnect"
          components={{ em: <em /> }}
          values={{ name: firstName }}
        />
      </div>
      <p className={styles.connIntro}>
        {t("notifications:deepLink.connection.noteIntro")}
      </p>
      <div className={styles.connNote}>{c.note}</div>
      <button
        type="button"
        className={styles.mutualPill}
        onClick={() => navigate(routes.connections)}
      >
        <div className={styles.mutualAvs}>
          {c.mutuals.map((m) => (
            <div
              key={m.initials}
              className={`${styles.smAv} ${avClass[m.tint]}`}
            >
              {m.initials}
            </div>
          ))}
        </div>
        <div className={styles.mutualLabel}>
          {t("notifications:deepLink.connection.mutualConnections", {
            count: c.mutualCount,
          })}
        </div>
      </button>
      <div className={styles.btnRow}>
        <Button variant="primary" onClick={accept}>
          {t("notifications:deepLink.connection.accept")}
        </Button>
        <Button variant="ghost" onClick={decline}>
          {t("notifications:deepLink.connection.decline")}
        </Button>
      </div>
      <button
        type="button"
        className={styles.notNow}
        onClick={() =>
          showToast(
            t("notifications:deepLink.connection.remindLaterToast"),
            "info",
          )
        }
      >
        {t("notifications:deepLink.connection.notNow")}
      </button>
    </div>
  );
}

export function GatheringCard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const g = GATHERING;
  return (
    <div className={styles.card}>
      <div className={styles.evCover}>
        <div className={styles.evBadge}>
          {t("notifications:deepLink.gathering.badge")}
        </div>
      </div>
      <div className={styles.cardPad}>
        <div className={styles.evTitle}>{g.title}</div>
        <div className={styles.evMeta}>
          {g.meta.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className={styles.evConfirm}>
          <strong>
            {t("notifications:deepLink.gathering.guestListConfirmed")}
          </strong>{" "}
          {t("notifications:deepLink.gathering.confirmedByHost")}
        </div>
        <div className={styles.evActions}>
          <Button
            variant="primary"
            onClick={() =>
              showToast(
                t("notifications:deepLink.gathering.addedToastCalendar"),
                "success",
              )
            }
            style={{ flex: 1 }}
          >
            {t("notifications:deepLink.gathering.addToCalendar")}
          </Button>
          <Button
            variant="ghost"
            to={routes.gathering}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {t("notifications:deepLink.gathering.viewDetails")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReplyCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const r = REPLY;
  const [replies, setReplies] = useState<SentReply[]>([]);
  function addReply(body: string) {
    setReplies((prev) => [...prev, { id: `r-${Date.now()}`, body }]);
  }
  const repliedWhen = fmt.relativeTime(-r.repliedMinutesAgo, "minute");
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini
        initials={r.initials}
        tint={r.tint}
        name={r.name}
        meta={t("notifications:deepLink.reply.meta", { when: repliedWhen })}
      />
      <div className={styles.label}>
        {t("notifications:deepLink.reply.yourPost")}
      </div>
      <div className={styles.postExcerpt}>{r.postExcerpt}</div>
      <div className={`${styles.label} ${styles.labelGap}`}>
        {t("notifications:deepLink.reply.theirReply", { name: r.name })}
      </div>
      <div className={styles.replyBubble}>
        <div className={styles.rbHeader}>
          <div className={styles.rbAv}>{r.initials}</div>
          <div className={styles.rbName}>{r.name}</div>
          <div className={styles.rbTime}>{repliedWhen}</div>
        </div>
        <div className={styles.rbText}>{r.replyText}</div>
      </div>
      <SentReplies replies={replies} />
      <Composer initials="YO" replyToName={r.name} onSend={addReply} />
    </div>
  );
}

export function MentionCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const m = MENTION;
  const [replies, setReplies] = useState<SentReply[]>([]);
  function addReply(body: string) {
    setReplies((prev) => [...prev, { id: `r-${Date.now()}`, body }]);
  }
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini
        initials={m.initials}
        tint={m.tint}
        name={m.name}
        meta={t("notifications:deepLink.mention.meta", {
          when: fmt.relativeTime(-m.mentionedHoursAgo, "hour"),
        })}
      />
      <div className={styles.label}>
        {t("notifications:deepLink.mention.theirPost", { name: m.name })}
      </div>
      <div className={styles.mentionPost}>
        Really loved the panel discussion at last week's meetup. Shoutout to{" "}
        <span className={styles.mentionHighlight}>@you</span> for the point
        about accessible event design — it sparked a whole conversation in our
        team and we're now rethinking how we do Gathering descriptions.
      </div>
      <SentReplies replies={replies} />
      <Composer initials="YO" replyToName={m.name} onSend={addReply} />
    </div>
  );
}

export function ModerationCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <div className={styles.modIcon}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="var(--plum)"
            strokeWidth="1.8"
          />
          <path
            d="M11 7v4.5M11 14.5v.5"
            stroke="var(--plum)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={styles.modHead}>
        {t("notifications:deepLink.moderation.heading")}
      </div>
      <div className={styles.modRef}>
        <Translation
          i18nKey="notifications:deepLink.moderation.reference"
          components={{ refNum: <span className={styles.modRefN} /> }}
          values={{
            ref: MODERATION.ref,
            updated: fmt.date(MODERATION.updatedAt, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          }}
        />
      </div>
      <div className={styles.modBody}>{MODERATION.body}</div>
      <div className={styles.modActions}>
        <Button
          variant="primary"
          to={routes.appealOutcome}
          style={{ justifyContent: "center" }}
        >
          {t("notifications:deepLink.moderation.viewOutcome")}
        </Button>
        <Button
          variant="ghost"
          to={routes.governance}
          style={{ justifyContent: "center" }}
        >
          {t("notifications:deepLink.moderation.howItWorks")}
        </Button>
      </div>
    </div>
  );
}
