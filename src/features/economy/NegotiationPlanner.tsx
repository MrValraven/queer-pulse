import { useState } from "react";
import { FiCheck, FiCopy, FiTrendingUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  type NegotiationAngle,
  negotiationAngles,
  NEGOTIATION_LEVERS,
  NEGOTIATION_PRINCIPLES,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** A single selectable strategy card in the planner. */
function AngleCard({
  angle,
  selected,
  onSelect,
}: {
  angle: NegotiationAngle;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={[styles.angle, selected && styles.angleOn].filter(Boolean).join(" ")}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.angleRadio} aria-hidden />
      <span className={styles.angleText}>
        <span className={styles.angleName}>{angle.name}</span>
        <span className={styles.angleBlurb}>{angle.blurb}</span>
      </span>
    </button>
  );
}

/** The negotiation planner — context, leverage, strategies, and a draft you can send. */
export function NegotiationPlanner({ app, onClose }: { app: Application; onClose: () => void }) {
  const { showToast } = useToast();
  const o = app.offer;
  const angles = negotiationAngles(app);
  const [angleId, setAngleId] = useState(angles[0].id);
  const [draft, setDraft] = useState(angles[0].draft);
  const [levers, setLevers] = useState<string[]>(["Base salary"]);
  const { submit, sending, done } = useSubmitFlow();

  const pickAngle = (a: NegotiationAngle) => {
    setAngleId(a.id);
    setDraft(a.draft);
  };
  const toggleLever = (l: string) =>
    setLevers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

  if (done) {
    return (
      <ModalShell onClose={onClose} success wide>
        <SuccessPanel title="Counter" em="sent." onClose={onClose}>
          Your reply is on its way to {app.companyName}. Asking is normal and expected — you've done
          this exactly right.
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} wide>
      <div className={styles.eyebrow}>Offer negotiation</div>
      <h2 className={styles.title}>
        Ask for what it's <em>worth.</em>
      </h2>
      <p className={styles.sub}>
        Negotiating is expected — most offers have room. Here's your leverage, your levers, and five
        ways to make the ask.
      </p>

      {o && (
        <>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>On the table</span>
                <span className={styles.rowV}>{o.salary}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>Holiday</span>
                <span className={styles.rowV}>{o.holiday}</span>
              </div>
            </div>
          </div>
          <div className={styles.market}>
            <FiTrendingUp className={styles.marketIcon} size={18} aria-hidden />
            <span>{o.market}</span>
          </div>
        </>
      )}

      <div className={styles.eyebrow}>What matters most to you</div>
      <div className={styles.levers}>
        {NEGOTIATION_LEVERS.map((l) => (
          <button
            key={l}
            type="button"
            className={[styles.lever, levers.includes(l) && styles.leverOn].filter(Boolean).join(" ")}
            onClick={() => toggleLever(l)}
            aria-pressed={levers.includes(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {NEGOTIATION_PRINCIPLES.map((t) => (
          <li key={t} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden /> {t}
          </li>
        ))}
      </ul>

      <div className={styles.eyebrow}>Pick your angle</div>
      <div className={styles.angles}>
        {angles.map((a) => (
          <AngleCard key={a.id} angle={a} selected={a.id === angleId} onSelect={() => pickAngle(a)} />
        ))}
      </div>

      <div className={styles.field}>
        <label htmlFor="neg-draft">Your draft reply — edit it to sound like you</label>
        <textarea
          id="neg-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ minHeight: 150 }}
        />
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={sending}
          onClick={() => {
            navigator.clipboard?.writeText(draft);
            showToast("Draft copied to clipboard", "success");
          }}
        >
          <FiCopy size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} aria-hidden /> Copy draft
        </button>
        <Button size="lg" disabled={sending || !draft.trim()} onClick={() => submit()}>
          {sending ? <Sending label="Sending…" /> : "Send reply →"}
        </Button>
      </div>
    </ModalShell>
  );
}
