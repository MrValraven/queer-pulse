import { useState } from "react";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import { Button, Sending } from "../../shared/components/ui";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

type Mode = "host" | "attend";

export function SoberHostModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("host");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid = name.trim().length > 1 && detail.trim().length > 4;

  const submit = () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    setTimeout(() => setPhase("done"), 1100);
  };

  return (
    <ResourceModal
      title={phase === "done" ? "" : "Sober gatherings"}
      onClose={onClose}
    >
      {phase === "done" ? (
        <PlumSuccess
          title={
            mode === "host" ? (
              <>
                Gathering <em>submitted.</em>
              </>
            ) : (
              <>
                You're <em>in.</em>
              </>
            )
          }
          sub={
            mode === "host"
              ? "A coordinator will confirm the alcohol-free listing and add it to the calendar within a day. You'll get the host checklist by email."
              : "We've saved your spot. The private location and a gentle reminder will reach you the day before — nothing is shared publicly."
          }
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>
              Start an alcohol-free meet-up, or join an existing peer meeting.
              Either way, you decide how visible you are.
            </p>

            <span className={styles.label}>What would you like to do?</span>
            <div className={styles.options}>
              <button
                type="button"
                className={`${styles.option} ${mode === "host" ? styles.optionSelected : ""}`}
                onClick={() => setMode("host")}
              >
                <span className={styles.optIcon}>
                  <FiPlusCircle />
                </span>
                <span className={styles.optName}>Host a meeting</span>
                <span className={styles.optDesc}>
                  Propose a new alcohol-free gathering.
                </span>
              </button>
              <button
                type="button"
                className={`${styles.option} ${mode === "attend" ? styles.optionSelected : ""}`}
                onClick={() => setMode("attend")}
              >
                <span className={styles.optIcon}>
                  <FiUsers />
                </span>
                <span className={styles.optName}>Attend a meeting</span>
                <span className={styles.optDesc}>
                  Ask to join a peer support meeting.
                </span>
              </button>
            </div>

            <span className={styles.label}>
              {mode === "host" ? "Your name" : "Name we should greet you by"}
            </span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                mode === "host"
                  ? "e.g. Mariana L."
                  : "First name or chosen name"
              }
            />

            <span className={styles.label}>
              {mode === "host"
                ? "What and where"
                : "Which meeting (and anything to flag)"}
            </span>
            <textarea
              className={styles.textarea}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                mode === "host"
                  ? "A morning walk, a quiet book club, a peer support circle… venue, day, rough time."
                  : "e.g. the weekly Sober & Queer peer support — and whether you'd like a buddy to meet you there."
              }
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={submit}
              disabled={!valid || phase === "loading"}
            >
              {phase === "loading" ? (
                <Sending label="Sending…" />
              ) : mode === "host" ? (
                "Submit gathering"
              ) : (
                "Request to attend"
              )}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  );
}
