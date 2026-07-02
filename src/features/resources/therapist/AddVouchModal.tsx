import { useState } from "react";
import {
  Button,
  FormField,
  ModalSheet,
  Sending,
  SuccessPanel,
} from "../../../shared/components/ui";
import styles from "./TherapistProfilePage.module.css";

type Phase = "idle" | "sending" | "sent";

/** Simulated anonymised-vouch flow, opened from the dashed vouch card. */
export function AddVouchModal({
  therapistShort,
  onClose,
}: {
  therapistShort: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [byline, setByline] = useState("");

  function submit() {
    if (phase !== "idle" || !text.trim()) return;
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 1200);
  }

  if (phase === "sent") {
    return (
      <ModalSheet onClose={onClose} success ariaLabel="Vouch received">
        <SuccessPanel title="Vouch received," em="thank you." onClose={onClose}>
          A moderator reads every vouch before it's published — yours will
          appear within a couple of days, anonymised exactly as you wrote it.{" "}
          {therapistShort} won't see who sent it, and neither will the clinic.
        </SuccessPanel>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet onClose={onClose} ariaLabel={`Vouch for ${therapistShort}`}>
      <div className={styles.vmEyebrow}>Community vouch</div>
      <h3 className={styles.vmTitle}>
        Have you seen {therapistShort}? <em>Say so.</em>
      </h3>
      <p className={styles.vmSub}>
        Vouches are anonymised — {therapistShort} won't see who wrote what, and
        neither will the clinic. One honest paragraph helps the next member
        decide.
      </p>
      <FormField label="Your vouch" required>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was it like to work with them? What should the next member know?"
        />
      </FormField>
      <FormField
        label="How should we describe you? (optional)"
        helper="Shown instead of your name — keep it as vague as you like."
      >
        <input
          type="text"
          value={byline}
          onChange={(e) => setByline(e.target.value)}
          placeholder="e.g. Member · couple work"
        />
      </FormField>
      <div className={styles.vmFoot}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          disabled={phase === "sending" || !text.trim()}
        >
          {phase === "sending" ? <Sending label="Sending…" /> : "Add my vouch"}
        </Button>
      </div>
    </ModalSheet>
  );
}
