import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { useAuth } from "../../app/providers/authContext";
import { lazyModal } from "../../app/providers/lazyModal";
import { ModalLoadBoundary } from "../../app/providers/ModalLoadBoundary";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ShareContent,
  ShareMenuOption,
} from "../messages/share/shareMenu.types";
import { toAbsoluteShareUrl } from "../messages/share/shareToChat.helpers";
import { useShareMenuItems } from "../messages/share/useShareMenuItems";
import { useShareToCommunityPicker } from "../messages/share/useShareToCommunityPicker";
import type { StudioMenuItem } from "./kit/StudioMenu";
import { StudioShareToChatModal } from "./share/StudioShareToChatModal";
import {
  studioLinkPath,
  type StudioLinkTarget,
} from "./share/studioLinkTarget";
import { studioShareContent } from "./share/studioShareContent";
import { useStudioShareRules } from "./share/useStudioShareRules";

// The community picker's chunk loads on its first pick, as from ShareMenu.
const shareToCommunityModal = lazyModal(() =>
  import("../economy/ShareToCommunityModal").then(
    (module) => module.ShareToCommunityModal,
  ),
);

/** What a hero's Share hands its "..." menu once it folds there
 *  (`useIsHeroShareFolded`). */
export interface StudioFoldedShare {
  target: StudioLinkTarget;
  title: string;
}

/** The picker a folded item opened, with the share it opened for. */
type FoldedPicker = {
  kind: "message" | "community";
  share: StudioFoldedShare;
};

/** No share: no Studio link, so the hooks below read nothing. */
const NO_CONTENT: ShareContent = {
  path: "",
  title: "",
  kind: "studio",
  text: "",
};

/** A ShareMenu item as a Studio menu item. WhatsApp leaves for its site in
 *  a new tab, as the ShareMenu's link item does. */
function studioMenuItemOf(option: ShareMenuOption): StudioMenuItem {
  const { href, onSelect } = option;
  return {
    id: `share-${option.key}`,
    label: option.label,
    icon: option.icon,
    onSelect: href
      ? () => void window.open(href, "_blank", "noopener,noreferrer")
      : (onSelect ?? (() => undefined)),
  };
}

/**
 * A hero's Share once it folds into the hero's "..." menu: every item the
 * hero's ShareMenu offers (useShareMenuItems), in its order and under its
 * rules: Send in a message, Share to a community, WhatsApp, the device's
 * share sheet, Copy message and Copy link. `dialog` holds the two pickers,
 * which outlast the menu. A picker keeps the share it opened for, and
 * closes if the hero's Share leaves the menu again. Left without a share,
 * it offers nothing and reads nothing.
 */
export function useStudioFoldedShareItems(
  share: StudioFoldedShare | undefined,
): { items: StudioMenuItem[]; dialog: ReactNode } {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [picker, setPicker] = useState<FoldedPicker | null>(null);
  const [communityLoadFailureCount, setCommunityLoadFailureCount] = useState(0);
  // The Share moved back to the row (a wider window): its picker goes too.
  if (picker !== null && share === undefined) setPicker(null);
  const content = share
    ? studioShareContent(share.target, share.title)
    : NO_CONTENT;
  const rules = useStudioShareRules(share?.target ?? null);
  const community = useShareToCommunityPicker(content);
  const close = () => setPicker(null);
  const openPicker = (kind: FoldedPicker["kind"]) => () => {
    if (share) setPicker({ kind, share });
  };
  const options = useShareMenuItems(
    content,
    {
      canShare: Boolean(user),
      isOpen: picker?.kind === "message",
      open: openPicker("message"),
      close,
    },
    {
      shouldOfferSendInMessage: rules.canSendToOthers,
      shareToCommunity: {
        ...community,
        isOpen: picker?.kind === "community",
        open: openPicker("community"),
        close,
      },
    },
  );
  const items = share ? options.map(studioMenuItemOf) : [];
  const dialog = (
    <>
      <AnimatePresence>
        {picker?.kind === "message" && (
          <StudioShareToChatModal
            key="send-in-message"
            target={picker.share.target}
            title={picker.share.title}
            onClose={close}
          />
        )}
      </AnimatePresence>
      <ModalLoadBoundary
        key={communityLoadFailureCount}
        onFailure={() => {
          shareToCommunityModal.retryAfterFailure();
          setCommunityLoadFailureCount((count) => count + 1);
          close();
        }}
      >
        <AnimatePresence>
          {picker?.kind === "community" && (
            <shareToCommunityModal.Component
              key="share-to-community"
              title={picker.share.title}
              url={toAbsoluteShareUrl(studioLinkPath(picker.share.target))}
              defaultNote={t("messages:shareToCommunity.studioDefaultNote")}
              notice={
                community.ownPersonaName
                  ? t("messages:shareToCommunity.ownPersonaNote", {
                      persona: community.ownPersonaName,
                    })
                  : undefined
              }
              onClose={close}
            />
          )}
        </AnimatePresence>
      </ModalLoadBoundary>
    </>
  );
  return { items, dialog };
}

/** The folded Share items a track hero hands the track menu inside it: the
 *  menu shows them in place of its own Send in a message and Copy link
 *  (useStudioTrackMenuItems). Null everywhere else. */
export const StudioFoldedShareItemsContext = createContext<
  StudioMenuItem[] | null
>(null);

export function useStudioFoldedShareItemsContext(): StudioMenuItem[] | null {
  return useContext(StudioFoldedShareItemsContext);
}
