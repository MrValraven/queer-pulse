import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { DELIVERY_OPTIONS, ANON_OPTIONS } from "./giftMembership.data";
import styles from "./GiftMembershipPage.module.css";

export function GiftMembershipForm() {
  const { showToast } = useToast();
  const [rName, setRName] = useState("Rita Vasquez");
  const [rContact, setRContact] = useState("rita@example.com");
  const [sName, setSName] = useState("Tomás Mendes");
  const [anon, setAnon] = useState("no");
  const [note, setNote] = useState(
    "For everything you do at the Thursday clinic. From all of us, but mostly from me.",
  );
  const [delivery, setDelivery] = useState<"now" | "schedule" | "print">("now");

  const firstName = rName.trim().split(" ")[0] || "Friend";
  let sender = sName.trim() || "A friend";
  if (anon === "yes") sender = "A friend";
  if (anon === "initials") {
    sender =
      sName
        .trim()
        .split(" ")
        .map((p) => p[0])
        .join("") + ".";
  }
  const deliveryNote =
    DELIVERY_OPTIONS.find((d) => d.id === delivery)?.note ??
    "delivered immediately";

  function submit(e: FormEvent) {
    e.preventDefault();
    showToast(`Charged €96 · invitation sent to ${firstName}`, "success");
  }

  return (
    <form onSubmit={submit}>
      <div className={styles.formSectionH}>Recipient</div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>
            Their name{" "}
            <span className={styles.opt}>— how they'll be addressed</span>
          </label>
          <input
            type="text"
            value={rName}
            onChange={(e) => setRName(e.target.value)}
            placeholder="Tomás Mendes"
          />
        </div>
        <div className={styles.field}>
          <label>Their email · or phone</label>
          <input
            type="text"
            value={rContact}
            onChange={(e) => setRContact(e.target.value)}
          />
          <div className={styles.fieldHint}>
            We use it once · to send the invitation. They control what happens
            after.
          </div>
        </div>
      </div>

      <div className={styles.formSectionH}>From you</div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>How you'd like to be named</label>
          <input
            type="text"
            value={sName}
            onChange={(e) => setSName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>
            Anonymous? · <span className={styles.opt}>just to them</span>
          </label>
          <select value={anon} onChange={(e) => setAnon(e.target.value)}>
            {ANON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>
          A short note{" "}
          <span className={styles.opt}>
            — optional · plain text · printed on the card
          </span>
        </label>
        <textarea
          maxLength={280}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="For everything you do at the Thursday clinic. From all of us, but mostly from me."
        />
        <div className={styles.fieldHint}>{note.length} / 280 characters</div>
      </div>

      <div className={styles.formSectionH}>Delivery</div>
      <p className={styles.deliveryIntro}>When should the invitation arrive?</p>
      <div className={styles.deliveryGrid}>
        {DELIVERY_OPTIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`${styles.delivery} ${delivery === d.id ? styles.selected : ""}`}
            onClick={() => setDelivery(d.id)}
          >
            <b>{d.label}</b>
            <span>{d.desc}</span>
          </button>
        ))}
      </div>

      <div className={styles.previewH}>Preview · what they'll see</div>
      <div className={styles.previewCard}>
        <span className={styles.previewStamp}>From a friend</span>
        <h2>
          {firstName} — someone got <em>your back.</em>
        </h2>
        <p className={styles.previewNote}>
          {note.trim() ? `"${note.trim()}"` : ""}
        </p>
        <div className={styles.previewSender}>
          — <b>{sender}</b> · with a year of Sustainer membership · €96 ·
          activate any time before <b>9 Sep 2026</b>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.summary}>
          One Sustainer gift ·{" "}
          <b>
            €<em>96</em>
          </b>{" "}
          · <span>{deliveryNote}</span>
        </div>
        <Button variant="primary" type="submit">
          Pay · gift {firstName} →
        </Button>
      </div>
    </form>
  );
}
