import type { NotifType } from "./notifications.types";

export type {
  NotifType,
  NotifAction,
  Notification,
} from "./notifications.types";
export { buildNotifications, DEMO_UNREAD_IDS } from "./notificationsList.data";

/** Stable `value` is the filter's stored/URL-safe id — `labelKey` resolves the
 * display text. Never switch on the translated label (see i18n sweep §5.1). */
export const notificationTabs: {
  value: "all" | NotifType;
  labelKey: string;
}[] = [
  { value: "all", labelKey: "notifications:tabs.all" },
  { value: "messages", labelKey: "notifications:tabs.messages" },
  { value: "events", labelKey: "notifications:tabs.events" },
  { value: "community", labelKey: "notifications:tabs.community" },
  { value: "platform", labelKey: "notifications:tabs.platform" },
];
