import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import {
  AdminModal,
  AdminAvatar,
  AdminChip,
  AdminSeg,
  AdminCheckLine,
} from "./ui";
import { portrait } from "./adminPeople.data";
import { VERIFY_REVIEW, type VerifyQueueItem } from "./adminMembers.data";
import { ADMIN_PROFILE } from "../../shared/components/layout/adminNav.data";
import styles from "./AdminMembersPage.module.css";

const firstName = (full: string) => full.split(" ")[0];

/* ── Verify modal (voucher review) ───────────────────────── */

export function VerifyModal({
  item,
  onClose,
  onAskMore,
  onWelcome,
}: {
  item: VerifyQueueItem;
  onClose: () => void;
  onAskMore: () => void;
  onWelcome: () => void;
}) {
  const review = VERIFY_REVIEW[item.id];
  const first = firstName(item.name);
  if (!review) return null;

  return (
    <AdminModal
      onClose={onClose}
      eyebrow="Reviewing a welcome"
      title={
        <>
          Welcome <em>{first}</em> in?
        </>
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Not yet
          </Button>
          <Button variant="ghost" size="md" onClick={onAskMore}>
            Ask for another vouch
          </Button>
          <Button variant="jade" size="md" onClick={onWelcome}>
            Welcome {first} in
          </Button>
        </>
      }
    >
      <p className={styles.modalIntro}>
        Verification is built on the people who vouched for {first}. Their
        standing is what your trust rests on — take a moment with it.
      </p>

      <div className={styles.voucherList}>
        {review.vouchers.map((v) => (
          <div key={v.name} className={styles.voucherRow}>
            <AdminAvatar
              initials={v.initials}
              tone={v.tone}
              size="md"
              src={portrait(v.name)}
            />
            <div className={styles.voucherTx}>
              <span className={styles.voucherName}>{v.name}</span>
              <span className={styles.voucherMeta}>{v.meta}</span>
            </div>
            <AdminChip tone={v.standing === "Trusted" ? "jade" : "amber"} dot>
              {v.standing}
            </AdminChip>
          </div>
        ))}
      </div>

      {review.flags.map((f) => (
        <div key={f} className={styles.flagNote}>
          <FiAlertTriangle aria-hidden />
          <span>{f}</span>
        </div>
      ))}

      <div
        className={`${styles.recNote} ${review.rec.tone === "jade" ? styles.recJade : styles.recAmber}`}
      >
        <FiCheckCircle aria-hidden />
        <span>{review.rec.text}</span>
      </div>
    </AdminModal>
  );
}

/* ── Message modal ───────────────────────────────────────── */

const SEND_AS = [`${ADMIN_PROFILE.firstName} (you)`, "Trust & Safety team"];

export function MessageModal({
  name,
  onClose,
  onSend,
}: {
  name: string;
  onClose: () => void;
  onSend: () => void;
}) {
  const first = firstName(name);
  const [sendAs, setSendAs] = useState(SEND_AS[0]!);
  const [body, setBody] = useState("");

  return (
    <AdminModal
      onClose={onClose}
      eyebrow="Reaching out"
      title={
        <>
          Message <em>{first}</em>
        </>
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={onSend}>
            Send message
          </Button>
        </>
      }
    >
      <label className={styles.fieldLabel}>Send as</label>
      <AdminSeg options={SEND_AS} value={sendAs} onChange={setSendAs} />

      <label className={styles.fieldLabel} htmlFor="msg-body">
        Message
      </label>
      <textarea
        id="msg-body"
        className={styles.textarea}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Write to ${first}… a check-in, a heads-up, an offer of support.`}
        rows={4}
      />

      <p className={styles.transparency}>
        Admin messages are clearly labelled as official — never disguised as a
        peer. {first} can always reply.
      </p>
    </AdminModal>
  );
}

/* ── Restrict modal ──────────────────────────────────────── */

const DURATIONS = ["24h", "7 days", "30 days", "Permanent"];
const SCOPES = ["This community", "Platform-wide"];
const REASONS = [
  "Repeated harassment after a warning",
  "Misgendering / deadnaming",
  "Hostile or abusive conduct",
  "Other — explain below",
];

export function RestrictModal({
  name,
  onClose,
  onApply,
  onMissingReason,
}: {
  name: string;
  onClose: () => void;
  onApply: (dur: string, scope: string) => void;
  onMissingReason: () => void;
}) {
  const first = firstName(name);
  const [dur, setDur] = useState("7 days");
  const [scope, setScope] = useState(SCOPES[0]!);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <AdminModal
      onClose={onClose}
      eyebrow="Limiting access, carefully"
      title={
        <>
          Restrict <em>{first}</em>
        </>
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => (reason ? onApply(dur, scope) : onMissingReason())}
          >
            Apply restriction
          </Button>
        </>
      }
    >
      <label className={styles.fieldLabel}>Duration</label>
      <AdminSeg options={DURATIONS} value={dur} onChange={setDur} />

      <label className={styles.fieldLabel}>Scope</label>
      <AdminSeg options={SCOPES} value={scope} onChange={setScope} />

      <label className={styles.fieldLabel}>Reason</label>
      <div className={styles.reasonList}>
        {REASONS.map((r) => (
          <AdminCheckLine
            key={r}
            checked={reason === r}
            onChange={() => setReason(r)}
            title={r}
          />
        ))}
      </div>

      <textarea
        className={styles.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`A note for ${first} (they will see it)…`}
        rows={3}
      />

      <p className={styles.transparency}>
        {first} keeps full access to support and appeals. A restriction limits
        posting — it never cuts someone off from help.
      </p>
    </AdminModal>
  );
}
