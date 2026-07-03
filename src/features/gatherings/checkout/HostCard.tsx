import { useState } from "react";
import { FiCheck, FiStar } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function HostCard() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  function send() {
    if (!msg.trim()) return;
    setOpen(false);
    setMsg("");
    showToast("Sent to Tomás — you'll get a reply by email.", "success");
  }

  return (
    <div className={s["co-host"]}>
      <div className={s["co-host-av"]}>
        TB
        <span className={s["co-host-vbadge"]} aria-hidden>
          <FiCheck />
        </span>
      </div>
      <div>
        <div className={s["co-host-name"]}>
          Tomás Beto <span className={s["co-host-verif"]}>Verified host</span>
        </div>
        <div className={s["co-host-meta"]}>
          Hosting since 2024 · 24 suppers · 4.9{" "}
          <FiStar aria-hidden style={{ verticalAlign: "-1px" }} /> from 180
          guests
        </div>
      </div>
      <button
        className={s["co-host-ask"]}
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        Ask a question
      </button>
      <div className={cx(s["co-ask-box"], open && s.show)}>
        <label
          className={s["co-lbl"]}
          htmlFor="askInput"
          style={{ marginTop: 8 }}
        >
          Message Tomás before you book
        </label>
        <textarea
          className={s["co-ta"]}
          id="askInput"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="e.g. Is the space step-free? Can I come solo?"
        />
        <div className={s["co-ask-send"]}>
          <Button
            variant="primary"
            onClick={send}
            style={{ padding: "9px 18px", fontSize: 13.5 }}
          >
            Send to host →
          </Button>
        </div>
      </div>
    </div>
  );
}
