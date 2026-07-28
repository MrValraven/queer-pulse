import { useState } from "react";
import { FiCheck, FiStar } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { EVENT } from "./checkout.data";
import { cx } from "./cx";
import s from "./checkout.module.css";

const SUPPER_COUNT = 24;
const HOST_SINCE_YEAR = 2024;
const HOST_RATING = "4.9";
const HOST_GUEST_COUNT = 180;

export function HostCard() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const hostFirstName = EVENT.hostName.split(" ")[0] ?? EVENT.hostName;

  function send() {
    if (!message.trim()) return;
    setOpen(false);
    setMessage("");
    showToast(
      t("gatherings:checkout.host.messageSentToast", { host: hostFirstName }),
      "success",
    );
  }

  return (
    <div className={s["co-host"]}>
      <div className={s["co-host-av"]}>
        {EVENT.hostInitials}
        <span className={s["co-host-vbadge"]} aria-hidden>
          <FiCheck />
        </span>
      </div>
      <div>
        <div className={s["co-host-name"]}>
          {EVENT.hostName}{" "}
          <span className={s["co-host-verif"]}>
            {t("gatherings:checkout.host.verifiedBadge")}
          </span>
        </div>
        <div className={s["co-host-meta"]}>
          {t("gatherings:checkout.host.statsLineBeforeStar", {
            count: SUPPER_COUNT,
            year: HOST_SINCE_YEAR,
            rating: HOST_RATING,
          })}{" "}
          <FiStar aria-hidden style={{ verticalAlign: "-1px" }} />{" "}
          {t("gatherings:checkout.host.statsLineAfterStar", {
            guestCount: HOST_GUEST_COUNT,
          })}
        </div>
      </div>
      <button
        className={s["co-host-ask"]}
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        {t("gatherings:checkout.host.askQuestionCta")}
      </button>
      <div className={cx(s["co-ask-box"], open && s.show)}>
        <label
          className={s["co-lbl"]}
          htmlFor="askInput"
          style={{ marginTop: 8 }}
        >
          {t("gatherings:checkout.host.messageLabel", { host: hostFirstName })}
        </label>
        <textarea
          className={s["co-ta"]}
          id="askInput"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("gatherings:checkout.host.messagePlaceholder")}
        />
        <div className={s["co-ask-send"]}>
          <Button
            variant="primary"
            onClick={send}
            style={{ padding: "9px 18px", fontSize: 13.5 }}
          >
            {t("gatherings:checkout.host.sendCta")} →
          </Button>
        </div>
      </div>
    </div>
  );
}
