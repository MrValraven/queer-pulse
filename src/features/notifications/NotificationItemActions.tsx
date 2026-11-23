import { useState, type PointerEvent } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWearCommunityBadge } from "../communities/badges/api/useCommunityBadgeMutations";
import { communityBadgeErrorText } from "../communities/badges/communityBadgeErrors";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import { linkToPath } from "../../app/routeMap";
import { ReportListingModal } from "../economy/ReportListingModal";
import { communityGiftReportSubject } from "./communityBadgeNotifications";
import type { Notification } from "./data";
import type { NotifAction } from "./notifications.types";
import wearingStyles from "../communities/badges/CommunityBadgeSheet.module.css";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

/**
 * The action buttons under a notification's text. The row's own `primary`
 * action takes the plum fill it always had; every other action is the quiet
 * outlined ghost. Both are the shared small `<Button>`, so they carry the
 * app's focus ring, disabled treatment and tap-target floor.
 */
export function NotificationItemActions({
  notificationId,
  actions,
  onResolve,
  onBeforeNavigate,
  onMarkRead,
  senderName,
}: {
  notificationId: NotificationId;
  actions: NotifAction[];
  onResolve: (id: NotificationId, toast: string) => void;
  /** Runs just before an action navigates, for a row that must refresh data. */
  onBeforeNavigate?: () => void;
  /** Marks the row read, for an action that settles what the row asked. */
  onMarkRead?: (id: NotificationId) => void;
  /** The member who sent the gift, for the report dialog's title. A gift from
   *  a deleted member has none. */
  senderName?: string;
}) {
  const navigate = useNavigate();
  // PRD-15. A "wants to connect" row answers the request from here, so the
  // mutations the connections page uses are wired straight into its buttons.
  // Every other row leaves these untouched.
  const { acceptRequest, declineRequest } = useConnectionActions();
  const [isAnswering, setIsAnswering] = useState(false);
  // A community badge earned row wears the badge from here. The row stays, so
  // the member can still open the sheet from it.
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const wearBadge = useWearCommunityBadge();
  // The badge already worn from this row, so a second click cannot repeat the PUT.
  const [wornBadgeId, setWornBadgeId] = useState<string | null>(null);
  // A gift row reports its gift from here, in the shared report dialog.
  const [reportingGift, setReportingGift] =
    useState<NotifAction["reportGift"]>(undefined);

  /**
   * Answer a connection request from the row. Resolves the row (removing it,
   * with a confirming toast) only once the server has agreed; a refusal has
   * already toasted its own reason and rolled the local move back, so the row
   * stays where it is and the member can try again.
   */
  async function answerConnection(
    response: NonNullable<NotifAction["connectionResponse"]>,
  ) {
    if (isAnswering) return;
    setIsAnswering(true);
    const respond =
      response.action === "accept" ? acceptRequest : declineRequest;
    const didSucceed = await respond({
      slug: response.memberSlug,
      id: response.connectionId,
    });
    setIsAnswering(false);
    if (didSucceed) onResolve(notificationId, response.toast);
  }

  return (
    <>
      <div className={styles.itemActions}>
        {actions.map((action) => {
          // An action only earns an interactive control when it can actually DO
          // something on click: resolve the row in place, or navigate to a real
          // destination. A placeholder `href` of "#" with no resolve handler
          // would be a dead button, so it renders as plain text.
          const canResolve = Boolean(action.resolve);
          const canAnswer = Boolean(action.connectionResponse);
          const canWear = Boolean(action.wearBadge);
          const canReport = Boolean(action.reportGift);
          const canNavigate = Boolean(action.href) && action.href !== "#";
          if (
            !canResolve &&
            !canAnswer &&
            !canWear &&
            !canReport &&
            !canNavigate
          ) {
            return (
              <span key={action.label} className={styles.meta}>
                {action.label}
              </span>
            );
          }
          if (canWear && wornBadgeId === action.wearBadge?.badgeId) {
            return (
              <FadeIn key={`${action.label}-worn`} as="span">
                <span className={wearingStyles.wearing}>
                  <FiCheck aria-hidden className={wearingStyles.wearingIcon} />
                  {t("communities:badges.sheet.wearing")}
                </span>
              </FadeIn>
            );
          }
          return (
            <Button
              key={action.label}
              variant={action.variant === "primary" ? "plum" : "ghost"}
              size="sm"
              className={styles.action}
              disabled={
                (canAnswer && isAnswering) || (canWear && wearBadge.isPending)
              }
              onClick={(event) => {
                // The row marks itself read on any click inside it; an action
                // does its own thing, so it stops the click here.
                event.stopPropagation();
                if (action.connectionResponse) {
                  void answerConnection(action.connectionResponse);
                } else if (action.wearBadge) {
                  const { communitySlug, badgeId, toast } = action.wearBadge;
                  wearBadge.mutate(
                    { slug: communitySlug, badgeId },
                    {
                      onSuccess: () => {
                        setWornBadgeId(badgeId);
                        showToast(toast, "success");
                        // Wearing the badge settles what the row asked.
                        onMarkRead?.(notificationId);
                      },
                      onError: (error) =>
                        showToast(
                          communityBadgeErrorText(error, t, fmt),
                          "error",
                        ),
                    },
                  );
                } else if (action.reportGift) {
                  setReportingGift(action.reportGift);
                } else if (action.resolve) {
                  onResolve(notificationId, action.resolve.toast);
                } else {
                  onBeforeNavigate?.();
                  void navigate(linkToPath(action.href));
                }
              }}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
      {/* The dialog is portalled out of the row, so the bell's outside-press
        dismiss would read a press inside it as outside and close the bell,
        unmounting the dialog mid-report. Presses inside it stop here, after
        the dialog's own handlers have run. Hidden, so it takes no space. */}
      <div hidden onPointerDown={keepPressInside}>
        <AnimatePresence>
          {reportingGift && (
            <ReportListingModal
              key="report-gift"
              subjectType="community_gift"
              subjectId={reportingGift.giftId}
              subjectName={communityGiftReportSubject(
                t,
                reportingGift.giftName,
                senderName,
              )}
              onClose={() => setReportingGift(undefined)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/** Keeps a press inside the report dialog from reaching document listeners. */
function keepPressInside(event: PointerEvent<HTMLDivElement>) {
  event.nativeEvent.stopPropagation();
}
