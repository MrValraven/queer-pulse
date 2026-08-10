/**
 * Desk notifications demo content — ported verbatim from the DesignSync
 * prototype's `MAG.NOTIF.items`. Live mode now has a real notifications
 * backend (`GET /magazine/admin/notifications`, Wave C); this fixture stays
 * the demo-mode source behind `../api/useMagazineNotifications`, which maps
 * it to the same canonical `DeskNotificationView` shape the live rows use.
 *
 * `what` may still carry inline `<b>` markup from the design source — render
 * it through `stripEm` (see `../data/desk.copy`), never
 * `dangerouslySetInnerHTML`.
 */

export type DeskNotificationTone = "good" | "warn";

/** Where a notification row's click should navigate. Phase 1 only wires the
 * clicks to `onNavigate`; the actual route resolution is the caller's job. */
export type DeskNotificationRoute = "piece" | "money" | "pitches" | "after";

export interface DeskNotification {
  who: string;
  what: string;
  when: string;
  route: DeskNotificationRoute;
  tone: DeskNotificationTone;
}

export const DESK_NOTIFICATIONS: DeskNotification[] = [
  {
    who: "Tomás Mendes",
    what: "filed a draft of <b>The pharmacist who fills every prescription</b>",
    when: "Sat 11:04",
    route: "piece",
    tone: "good",
  },
  {
    who: "Ana Duarte",
    what: "signed off the sensitivity read on <b>The chosen-family budget</b>",
    when: "Sat 16:40",
    route: "piece",
    tone: "good",
  },
  {
    who: "Rui Alves",
    what: "has not been paid — filed 21 days ago",
    when: "Sun 09:00",
    route: "money",
    tone: "warn",
  },
  {
    who: "Inês Faria",
    what: "replied to your note on her pitch",
    when: "Sun 21:12",
    route: "pitches",
    tone: "good",
  },
  {
    who: "A reader",
    what: "wrote in about <b>On the bus to Faro</b>",
    when: "Today 08:15",
    route: "after",
    tone: "good",
  },
];
