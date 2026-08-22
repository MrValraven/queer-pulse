import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useRemoveMember,
  useSetMemberRole,
} from "../communities/api/useCommunityMutations";

/** The member a removal confirm is currently open for. */
export interface RemovalTarget {
  memberSlug?: string;
  name: string;
}

/** Roster rows are keyed by slug where there is one, and by name otherwise
 *  (demo's mock roster carries no member slugs). */
export function memberKey(memberSlug?: string, name?: string) {
  return memberSlug ?? name ?? "";
}

/**
 * The promote / demote / remove writes behind the mod panel's Members tab, so
 * `MembersTab` stays layout only (a plain hook returns no JSX, so the
 * per-component line limit doesn't apply to it, the same split
 * `useModToolsActions` makes for the community mod tools).
 *
 * Every write follows the same shape: re-badge or hide the row optimistically,
 * fire the mutation, and confirm it ONLY in `onSuccess`; on failure the local
 * change is reverted and the mod is told what happened. Before this, a 403 (a
 * community mod is not necessarily a platform moderator) or any 5xx left a
 * member looking removed or promoted for the rest of the session, under a
 * success toast, with the server disagreeing.
 *
 * Demo mode has no network and its mock roster carries no member slugs, so
 * there the local list IS the change, exactly as the prototype has always
 * behaved. In live mode a row with no resolvable slug is not something the API
 * can address, so it says so rather than pretending the action landed.
 */
export function useMembersTabActions(slug: string) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const setMemberRole = useSetMemberRole(slug);
  const removeMemberMutation = useRemoveMember(slug);
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [removalTarget, setRemovalTarget] = useState<RemovalTarget | null>(
    null,
  );
  // The row whose write is in flight, so its own actions stop taking input.
  const [busyKey, setBusyKey] = useState<string | null>(null);

  /** Live mode with no addressable member slug: say so, change nothing. */
  const reportUnavailable = (name: string) => {
    showToast(t("admin:modPanel.members.unavailableToast", { name }), "error");
  };

  const setRole = (
    memberSlug: string | undefined,
    name: string,
    role: "member" | "mod",
  ) => {
    const key = memberKey(memberSlug, name);
    const isPromoting = role === "mod";
    const applyLocally = () =>
      setPromoted((keys) =>
        isPromoting ? [...keys, key] : keys.filter((k) => k !== key),
      );
    const revertLocally = () =>
      setPromoted((keys) =>
        isPromoting ? keys.filter((k) => k !== key) : [...keys, key],
      );
    const done = () =>
      showToast(
        t(
          isPromoting
            ? "admin:modPanel.members.promotedToast"
            : "admin:modPanel.members.demotedToast",
          { name },
        ),
        isPromoting ? "success" : "info",
      );
    if (demoMode) {
      applyLocally();
      done();
      return;
    }
    if (!memberSlug) {
      reportUnavailable(name);
      return;
    }
    applyLocally();
    setBusyKey(key);
    setMemberRole.mutate(
      { memberSlug, role },
      {
        onSuccess: done,
        onError: () => {
          revertLocally();
          showToast(
            t("admin:modPanel.members.roleErrorToast", { name }),
            "error",
          );
        },
        onSettled: () => setBusyKey(null),
      },
    );
  };

  const confirmRemoval = () => {
    const target = removalTarget;
    if (!target || removeMemberMutation.isPending) return;
    const key = memberKey(target.memberSlug, target.name);
    const done = () => {
      setRemovalTarget(null);
      showToast(
        t("admin:modPanel.members.removedToast", { name: target.name }),
        "info",
      );
    };
    if (demoMode) {
      setRemoved((keys) => [...keys, key]);
      done();
      return;
    }
    if (!target.memberSlug) {
      setRemovalTarget(null);
      reportUnavailable(target.name);
      return;
    }
    setRemoved((keys) => [...keys, key]);
    setBusyKey(key);
    removeMemberMutation.mutate(target.memberSlug, {
      onSuccess: done,
      onError: () => {
        setRemoved((keys) => keys.filter((k) => k !== key));
        setRemovalTarget(null);
        showToast(
          t("admin:modPanel.members.removeErrorToast", { name: target.name }),
          "error",
        );
      },
      onSettled: () => setBusyKey(null),
    });
  };

  return {
    promoted,
    removed,
    busyKey,
    removalTarget,
    setRemovalTarget,
    isRemoving: removeMemberMutation.isPending,
    setRole,
    confirmRemoval,
  };
}
