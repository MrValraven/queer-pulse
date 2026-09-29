import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import { linkToPath } from "../../app/routeMap";
import type { Notification } from "./data";
import type { NotifAction } from "./notifications.types";
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
}: {
  notificationId: NotificationId;
  actions: NotifAction[];
  onResolve: (id: NotificationId, toast: string) => void;
}) {
  const navigate = useNavigate();
  // PRD-15. A "wants to connect" row answers the request from here, so the
  // mutations the connections page uses are wired straight into its buttons.
  // Every other row leaves these untouched.
  const { acceptRequest, declineRequest } = useConnectionActions();
  const [isAnswering, setIsAnswering] = useState(false);

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
    <div className={styles.itemActions}>
      {actions.map((action) => {
        // An action only earns an interactive control when it can actually DO
        // something on click: resolve the row in place, or navigate to a real
        // destination. A placeholder `href` of "#" with no resolve handler
        // would be a dead button, so it renders as plain text.
        const canResolve = Boolean(action.resolve);
        const canAnswer = Boolean(action.connectionResponse);
        const canNavigate = Boolean(action.href) && action.href !== "#";
        if (!canResolve && !canAnswer && !canNavigate) {
          return (
            <span key={action.label} className={styles.meta}>
              {action.label}
            </span>
          );
        }
        return (
          <Button
            key={action.label}
            variant={action.variant === "primary" ? "plum" : "ghost"}
            size="sm"
            className={styles.action}
            disabled={canAnswer && isAnswering}
            onClick={(event) => {
              // The row marks itself read on any click inside it; an action
              // does its own thing, so it stops the click here.
              event.stopPropagation();
              if (action.connectionResponse) {
                void answerConnection(action.connectionResponse);
              } else if (action.resolve) {
                onResolve(notificationId, action.resolve.toast);
              } else {
                void navigate(linkToPath(action.href));
              }
            }}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
