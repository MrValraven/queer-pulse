import { useState } from "react";
import { AdminDrawer } from "./ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminVouchGraphModal } from "./AdminVouchGraphModal";
import {
  RolesAndAccessSection,
  MemberOverviewSections,
  ModerationTimeline,
  SealedIdentity,
} from "./AdminMemberDrawerSections";
import { AdminMemberDrawerHeader } from "./AdminMemberDrawerHeader";
import { AdminMemberDrawerActions } from "./AdminMemberDrawerActions";
import { AdminMemberDrawerSkeleton } from "./AdminMemberDrawerSkeleton";
import { AdminMemberSuspensionControl } from "./AdminMemberSuspensionControl";
import { MessageModal, RestrictModal } from "./AdminMemberModals";
import {
  RESTRICT_DURATION_TO_API,
  RESTRICT_REASON_TO_CODE,
} from "./adminMemberModals.utils";
import { useAdminMember, useRestrictMember } from "./api/useAdminMembers";
import { type AdminMember } from "./adminMembers.data";

interface Props {
  member: AdminMember;
  onClose: () => void;
}

const firstName = (full: string) => full.split(" ")[0];

export function AdminMemberDrawer({ member, onClose }: Props) {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // "ban" opens the same RestrictModal as "restrict", preset to a permanent
  // (no-duration) restriction. There is no account-removal endpoint, so the
  // drawer no longer offers a "Remove member" flow that could only ever error:
  // a permanent ban IS the platform's most severe action, and it is real,
  // audited and appealable.
  const [modal, setModal] = useState<
    "message" | "restrict" | "ban" | "network" | null
  >(null);
  const { data: detail, isLoading } = useAdminMember(member);
  const restrictMutation = useRestrictMember();
  const first = firstName(member.name);

  return (
    <>
      {/* drawer + its modals */}
      <AdminDrawer
        label={t("admin:members.drawer.label", { name: member.name })}
        onClose={onClose}
        head={<AdminMemberDrawerHeader member={member} />}
        foot={
          <AdminMemberDrawerActions
            member={member}
            isRestrictPending={restrictMutation.isPending}
            onMessage={() => setModal("message")}
            onRestrict={() => setModal("restrict")}
            onBan={() => setModal("ban")}
          />
        }
      >
        {isLoading || !detail ? (
          <AdminMemberDrawerSkeleton />
        ) : (
          <>
            <RolesAndAccessSection member={member} detail={detail} />
            <AdminMemberSuspensionControl member={member} detail={detail} />
            <MemberOverviewSections
              detail={detail}
              memberName={member.name}
              onOpenNetwork={() => setModal("network")}
            />
            <ModerationTimeline entries={detail.moderationTimeline} />
          </>
        )}

        <SealedIdentity />
      </AdminDrawer>

      {modal === "network" && (
        <AdminVouchGraphModal
          focusSlug={member.slug}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "message" && (
        <MessageModal
          name={member.name}
          onClose={() => setModal(null)}
          onSend={() => {
            setModal(null);
            showToast(t("admin:members.drawer.messageSentToast"), "success");
          }}
        />
      )}

      {(modal === "restrict" || modal === "ban") && (
        <RestrictModal
          name={member.name}
          platformOnly={!demoMode}
          initialDuration={modal === "ban" ? "permanent" : "7d"}
          onClose={() => setModal(null)}
          onMissingReason={() =>
            showToast(
              t("admin:members.drawer.missingReasonToast", { name: first }),
              "error",
            )
          }
          onApply={(selection) => {
            if (demoMode) {
              // Demo keeps the simulated flow with an Undo affordance — the
              // roster is regenerated from fixtures, so nothing persists.
              setModal(null);
              onClose();
              showToast(
                t("admin:members.drawer.restrictedToast", {
                  name: first,
                  duration: selection.durationLabel,
                  scope: selection.scopeLabel,
                }),
                "success",
                undefined,
                {
                  label: t("admin:common.undo"),
                  onClick: () =>
                    showToast(
                      t("admin:members.drawer.restrictionUndoneToast"),
                      "info",
                    ),
                },
              );
              return;
            }
            // Live: a real platform-wide restriction. No Undo affordance — the
            // drawer's Suspension section (Lift suspension) is the honest way
            // back, not a toast button. Errors surface via the global
            // mutation-error toast.
            restrictMutation.mutate(
              {
                memberId: member.id,
                input: {
                  reasonCode: RESTRICT_REASON_TO_CODE[selection.reasonId],
                  note: selection.note,
                  duration: RESTRICT_DURATION_TO_API[selection.durationId],
                },
              },
              {
                onSuccess: () => {
                  setModal(null);
                  onClose();
                  showToast(
                    t("admin:members.drawer.restrictedToast", {
                      name: first,
                      duration: selection.durationLabel,
                      scope: selection.scopeLabel,
                    }),
                    "success",
                  );
                },
              },
            );
          }}
        />
      )}
    </>
  );
}
