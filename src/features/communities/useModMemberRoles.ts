import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AssignableRole } from "./api/communities.api";
import { useSetMemberRole } from "./api/useCommunityMutations";

/** A roster row's identity in the mod-tools optimistic maps: the member slug
 *  where there is one, the display name in demo mode where there isn't. */
export const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";

/** Which toast a completed role change reads out. Revoking co-owner has its
 *  own line because "is a member again" undersells what just changed. */
const ROLE_TOAST_KEY: Record<AssignableRole, string> = {
  mod: "communities:detail.modtools.toast.promoted",
  member: "communities:detail.modtools.toast.demoted",
  co_owner: "communities:detail.modtools.toast.coOwnerGranted",
};

const REVOKE_CO_OWNER_TOAST_KEY =
  "communities:detail.modtools.toast.coOwnerRevoked";

/**
 * Every roster role change mod tools can make: promote to mod, demote to
 * member, and (owner-only, server-enforced) grant or revoke co-owner.
 *
 * One optimistic role per member key, so a row's badge and its available
 * actions move together the moment the change is made. Two parallel
 * "promoted"/"demoted" lists could not express a third role without the two of
 * them disagreeing about what someone currently is.
 *
 * `closeConfirm` closes whatever dialog asked for the change, on success and
 * on failure alike: the two co-owner directions are confirmed first, and a
 * dialog left open over a rolled-back row reads as "it didn't go through yet".
 */
export function useModMemberRoles(
  slug: string,
  closeConfirm: () => void,
): {
  roleOverrides: Record<string, AssignableRole>;
  isRoleChangePending: boolean;
  promote: (memberSlug: string | undefined, name: string) => void;
  demote: (memberSlug: string | undefined, name: string) => void;
  confirmGrantCoOwner: (memberSlug: string | undefined, name: string) => void;
  confirmRevokeCoOwner: (memberSlug: string | undefined, name: string) => void;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const setMemberRole = useSetMemberRole(slug);
  const [roleOverrides, setRoleOverrides] = useState<
    Record<string, AssignableRole>
  >({});

  /**
   * The one role write behind every button here. The row's badge moves
   * immediately; the PATCH is the real change, and its invalidation refetches
   * the roster. On failure the previous role comes back and the mod is told,
   * so the row never keeps a standing the server refused (a 403 is the
   * expected answer whenever the viewer is not the owner).
   *
   * `toastKeyOverride` covers the case the target role alone cannot name:
   * going back to `member` reads as a demotion from mod by default.
   */
  const setRole = (
    memberSlug: string | undefined,
    name: string,
    role: AssignableRole,
    toastKeyOverride?: string,
  ) => {
    const key = memberKey(memberSlug, name);
    const previous = roleOverrides[key];
    setRoleOverrides((prev) => ({ ...prev, [key]: role }));
    const done = () => {
      closeConfirm();
      showToast(
        t(toastKeyOverride ?? ROLE_TOAST_KEY[role], { name }),
        role === "member" ? "info" : "success",
      );
    };
    if (demoMode || !memberSlug) {
      done();
      return;
    }
    setMemberRole.mutate(
      { memberSlug, role },
      {
        onSuccess: done,
        onError: () => {
          setRoleOverrides((prev) => {
            const next = { ...prev };
            if (previous) next[key] = previous;
            else delete next[key];
            return next;
          });
          closeConfirm();
          showToast(t("communities:common.error"), "error");
        },
      },
    );
  };

  return {
    roleOverrides,
    isRoleChangePending: setMemberRole.isPending,
    promote: (memberSlug, name) => setRole(memberSlug, name, "mod"),
    demote: (memberSlug, name) => setRole(memberSlug, name, "member"),
    /** Owner-only, and confirmed first: a co-owner can do everything the owner
     *  can except transfer ownership, archive the community, and change
     *  another co-owner's role. */
    confirmGrantCoOwner: (memberSlug, name) =>
      setRole(memberSlug, name, "co_owner"),
    confirmRevokeCoOwner: (memberSlug, name) =>
      setRole(memberSlug, name, "member", REVOKE_CO_OWNER_TOAST_KEY),
  };
}
