import { useMemo, useState } from "react";
import { Button, MemberSelectList, Modal } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RosterMember } from "./community.model";
import { photoOf } from "./communityPeople";
import { useTransferOwnership } from "./api/useCommunityMutations";

/**
 * Confirm step for the danger zone's "Transfer ownership" action —
 * owner-only. Reuses the shared `MemberSelectList` (the same roster/connection
 * picker used across the app's other member pickers) in single-select mode,
 * scoped to this community's own roster rather than the caller's connections —
 * ownership can only pass to someone already on this roster. Picking and
 * confirming are two separate steps (unlike `InviteCoOwnerModal`'s tap-to-act
 * pattern): transferring ownership is severe enough to want an explicit
 * confirm after the pick, mirroring `LeaveCommunityModal`'s pattern.
 */
export function TransferOwnershipModal({
  slug,
  name,
  roster,
  onClose,
}: {
  slug: string;
  name: string;
  roster: RosterMember[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const transfer = useTransferOwnership(slug);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const candidates = useMemo(
    () =>
      roster
        .filter((member) => member.role !== "owner" && member.slug)
        .map((member) => ({
          slug: member.slug!,
          name: member.name,
          avatarUrl: photoOf(member, demoMode),
          pronouns: member.pronouns,
        })),
    [roster, demoMode],
  );

  const chosenSlug = [...selected][0];
  const chosen = candidates.find((candidate) => candidate.slug === chosenSlug);

  const toggle = (memberSlug: string) => {
    setSelected((prev) =>
      prev.has(memberSlug) ? new Set() : new Set([memberSlug]),
    );
  };

  const onConfirm = () => {
    if (!chosenSlug) return;
    transfer.mutate(
      { memberSlug: chosenSlug },
      {
        onSuccess: () => {
          showToast(
            t("communities:detail.dangerZone.transfer.successToast", {
              owner: chosen?.name ?? "",
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(t("communities:detail.dangerZone.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("communities:detail.dangerZone.transfer.confirm.title", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={transfer.isPending}>
            {t("communities:detail.dangerZone.transfer.confirm.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!chosenSlug || transfer.isPending}
          >
            {t("communities:detail.dangerZone.transfer.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("communities:detail.dangerZone.transfer.confirm.body", { name })}</p>
      {candidates.length === 0 ? (
        <p>{t("communities:detail.dangerZone.transfer.confirm.empty")}</p>
      ) : (
        <MemberSelectList
          people={candidates}
          selected={selected}
          onToggle={toggle}
          multiSelect={false}
          searchPlaceholder={t(
            "communities:detail.dangerZone.transfer.confirm.searchPlaceholder",
          )}
        />
      )}
    </Modal>
  );
}
