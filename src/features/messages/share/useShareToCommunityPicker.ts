import { useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useMyCommunities } from "../../communities/api/useMyCommunities";
import { parseStudioLink } from "../../studio/share/studioLinkTarget";
import { useStudioShareRules } from "../../studio/share/useStudioShareRules";
import type { ShareContent } from "./shareMenu.types";

export interface ShareToCommunityController {
  /** A signed-in member with at least one community, sharing a Studio link
   *  the picker rules allow. The menu renders no item at all otherwise. */
  canShare: boolean;
  /** Set when the viewer runs the persona behind this release or track. */
  ownPersonaName: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * "Share to a community" for the shared `ShareMenu`: Studio links only, and
 * gated by the same rules as "Send in a message". The rules hook runs for
 * every menu with a null target for other kinds, which requests nothing, and
 * the membership map is read only for a signed-in member's Studio link.
 */
export function useShareToCommunityPicker(
  content: ShareContent,
): ShareToCommunityController {
  const { user } = useAuth();
  const studioTarget =
    content.kind === "studio" ? parseStudioLink(content.path) : null;
  const rules = useStudioShareRules(studioTarget);
  const memberships = useMyCommunities({
    enabled: Boolean(user) && studioTarget !== null,
  });
  const hasCommunity = Object.keys(memberships).length > 0;
  const [isOpen, setIsOpen] = useState(false);
  return {
    canShare:
      Boolean(user) &&
      studioTarget !== null &&
      hasCommunity &&
      rules.canSendToOthers,
    ownPersonaName: rules.ownPersonaName,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
