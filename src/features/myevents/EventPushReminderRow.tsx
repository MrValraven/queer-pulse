import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePushSubscription } from "../push/usePushSubscription";
import { sx } from "./myEvents.styles";

/**
 * The one genuinely-wired control in the event preferences modal: a real Web
 * Push toggle. Push is the channel the event-reminder cron uses to reach a
 * member's phone, so enabling it here actually turns on reminder delivery —
 * unlike the sibling rows in this modal, which stay an inert preview until
 * their backends exist.
 *
 * Dual-mode via `usePushSubscription`: demo registers the browser subscription
 * but never posts it to the API; live also persists it via `POST /push/subscribe`.
 * When push is unsupported, blocked at the browser level, or mid-request the row
 * is dimmed and inert rather than pretending a change was saved.
 */
export function EventPushReminderRow() {
  const { t } = useTranslation();
  const { supported, permission, isSubscribed, busy, enable, disable } =
    usePushSubscription();

  const blocked = permission === "denied";
  const disabled = !supported || blocked || busy;
  const description = !supported
    ? t("myevents:settingsModal.pushUnsupported")
    : blocked
      ? t("myevents:settingsModal.pushBlocked")
      : t("myevents:settingsModal.pushLiveDesc");
  const title = t("myevents:settingsModal.push");

  return (
    <div className={sx("set-row flush")}>
      <div className={sx("set-info")}>
        <div className={sx("set-t")}>{title}</div>
        <div className={sx("set-d")}>{description}</div>
      </div>
      <div
        className={disabled ? sx("set-control-off") : undefined}
        inert={disabled}
      >
        <Toggle
          tone="coral"
          checked={isSubscribed}
          onChange={(next) => {
            if (disabled) return;
            void (next ? enable() : disable());
          }}
          label={title}
        />
      </div>
    </div>
  );
}
