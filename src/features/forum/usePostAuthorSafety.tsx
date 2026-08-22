import { useState, type ReactNode } from "react";
import { useSocial } from "../../app/providers/useSocial";
import { useProfileData } from "../../app/providers/useProfile";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BlockMemberModal } from "../members/BlockMemberModal";
import type { BlockOptions } from "../social/api/social.api";

/** One entry in a post's ⋯ menu. Lives here (rather than in
 *  `PostActionsMenu`) so the safety actions below can be typed against it
 *  without the two modules importing each other's values. */
export interface PostMenuAction {
  key: string;
  label: string;
  run: () => void;
  danger?: boolean;
}

/** The post author a safety action would apply to. */
export interface PostAuthor {
  /** Member slug — the canonical key blocks and mutes are stored under. */
  slug?: string;
  /** Display name, used in the labels and the confirmation copy. */
  name: string;
  /** Institutional QueerPulse account: there is no person to mute or block. */
  official?: boolean;
}

/**
 * Mute / block actions for the author of a forum post or reply, wired to the
 * app-wide `useSocial()` store (the same one the feed, messages, connections and
 * profile surfaces use), so a mute made here hides that member everywhere.
 *
 * Forum and topics previously had no safety affordance at all: the only way to
 * mute someone whose reply you were reading was to leave for their profile.
 *
 * Returns nothing (`actions: []`, `dialog: null`) when there is nobody to act
 * on: no slug, the QueerPulse Official account, or the viewer's own post.
 * Mute is one-way and reversible so it fires straight away; block is a mutual
 * severance, so it confirms first through the shared `BlockMemberModal`.
 */
export function usePostAuthorSafety(author?: PostAuthor): {
  actions: PostMenuAction[];
  dialog: ReactNode;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { profile } = useProfileData();
  const { isMuted, toggleMute, isBlocked, toggleBlock } = useSocial();
  const [isConfirmingBlock, setIsConfirmingBlock] = useState(false);

  const slug = author?.slug;
  // Every hook above runs unconditionally; this bail-out only skips the derived
  // values, so the hook order is stable.
  if (!author || !slug || slug === profile.slug || author.official)
    return { actions: [], dialog: null };

  const firstName = firstNameOf(author.name);

  const dialog = isConfirmingBlock ? (
    <BlockMemberModal
      firstName={firstName}
      onCancel={() => setIsConfirmingBlock(false)}
      onConfirm={(options: BlockOptions) => {
        setIsConfirmingBlock(false);
        toggleBlock(slug, options);
        showToast(
          t(
            options.alsoReport
              ? "safety:profileMenu.blockedReportedToast"
              : "safety:profileMenu.blockedToast",
            { name: firstName },
          ),
          "success",
        );
      }}
    />
  ) : null;

  const muted = isMuted(slug);
  const blocked = isBlocked(slug);
  const actions: PostMenuAction[] = [
    {
      key: "mute",
      label: t(
        muted ? "safety:profileMenu.unmute" : "safety:profileMenu.mute",
        { name: firstName },
      ),
      run: () => {
        const nowMuted = toggleMute(slug);
        showToast(
          t(
            nowMuted
              ? "safety:profileMenu.mutedToast"
              : "safety:profileMenu.unmutedToast",
            { name: firstName },
          ),
          "success",
        );
      },
    },
    {
      key: "block",
      label: t(
        blocked ? "safety:profileMenu.unblock" : "safety:profileMenu.block",
        { name: firstName },
      ),
      danger: true,
      run: () => {
        // Unblocking is low-stakes and reversible, so it toggles straight away.
        if (blocked) {
          toggleBlock(slug);
          showToast(
            t("safety:profileMenu.unblockedToast", { name: firstName }),
            "success",
          );
          return;
        }
        setIsConfirmingBlock(true);
      },
    },
  ];

  return { actions, dialog };
}

/** The name used in safety copy, matching `ProfileSafetyMenu`'s first-name
 *  address ("Mute Rita" rather than "Mute Rita Vasconcelos"). */
function firstNameOf(name: string): string {
  return name.split(" ")[0] ?? name;
}
