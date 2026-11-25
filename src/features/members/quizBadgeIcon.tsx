import type { ReactNode } from "react";
import { communityBadgeIcon } from "../communities/badges/communityBadgeIcons";

/** The icon node of a quiz badge. An unknown key draws an award, so a newer
 *  backend never breaks the page. */
export function quizBadgeIconNode(iconKey: string): ReactNode {
  const Icon = communityBadgeIcon(iconKey);
  return <Icon aria-hidden />;
}
