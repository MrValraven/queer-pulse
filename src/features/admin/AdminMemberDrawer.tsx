import { useState } from "react";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { AdminDrawer, AdminAvatar, AdminChip } from "./ui";
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
import { AdminMemberSuspensionControl } from "./AdminMemberSuspensionControl";
import {
  MessageModal,
  RestrictModal,
  RESTRICT_DURATION_TO_API,
  RESTRICT_REASON_TO_CODE,
} from "./AdminMemberModals";
import { portrait } from "./adminPeople.data";
import {
  useAdminMember,
  useRestrictMember,
  useVerifyMember,
} from "./api/useAdminMembers";
import { type AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

interface Props {
  member: AdminMember;
  onClose: () => void;
}

const firstName = (full: string) => full.split(" ")[0];

export function AdminMemberDrawer({ member, onClose }: Props) {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [modal, setModal] = useState<"message" | "restrict" | "network" | null>(
    null,
  );
  const { data: detail, isLoading } = useAdminMember(member);
  const verifyMutation = useVerifyMember();
  const restrictMutation = useRestrictMember();
  const first = firstName(member.name);

  return (
    <>
      {/* drawer + its modals */}
      <AdminDrawer
        label={`${member.name}, member detail`}
        onClose={onClose}
        head={
          <div className={styles.dHead}>
            <AdminAvatar
              initials={member.initials}
              tone={member.tone}
              size="lg"
              verified={member.verified}
              src={portrait(member.name)}
            />
            <div>
              <h2 className={styles.dName}>{member.name}</h2>
              <div className={styles.dChips}>
                <AdminChip tone="plum">{member.pronoun}</AdminChip>
                <AdminChip
                  tone={member.verified ? "jade" : member.statusTone}
                  dot
                >
                  {member.verified
                    ? t("admin:members.drawer.verifiedChip")
                    : t("admin:members.status.openReports", {
                        count: member.openReportsCount ?? 0,
                      })}
                </AdminChip>
              </div>
            </div>
          </div>
        }
        foot={
          confirming && detail ? (
            <RemovePanel
              body={detail.removeBody}
              onKeep={() => setConfirming(false)}
              onContinue={() =>
                showToast(
                  t("admin:members.drawer.reasonRequiredToast"),
                  "error",
                )
              }
            />
          ) : (
            <div className={styles.dFoot}>
              {/* Verify + Restrict are wired to real backend endpoints
                  (`POST /admin/members/:id/verify` · `/restrict`, P2-3) in both
                  modes via demo-aware mutations. Message has no backend (it just
                  opens the DM composer) so it stays disabled-with-reason in
                  live; demo keeps its functional prototype. */}
              <Button
                variant="jade"
                size="md"
                disabled={verifyMutation.isPending || member.verified}
                onClick={() =>
                  verifyMutation.mutate(
                    { memberId: member.id, slug: member.slug },
                    {
                      onSuccess: () =>
                        showToast(
                          t("admin:members.drawer.verifiedToast", {
                            name: member.name,
                          }),
                          "success",
                        ),
                    },
                  )
                }
              >
                {t("admin:members.drawer.verifyCta")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                disabled={!demoMode}
                title={
                  demoMode
                    ? undefined
                    : t("admin:members.drawer.comingSoonToast")
                }
                onClick={() => setModal("message")}
              >
                {t("admin:members.drawer.messageCta")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                disabled={restrictMutation.isPending}
                onClick={() => setModal("restrict")}
              >
                {t("admin:members.drawer.restrictCta")}
              </Button>
              <Button
                variant="danger"
                size="md"
                disabled={!detail}
                onClick={() => setConfirming(true)}
              >
                {t("admin:members.drawer.removeCta")}
              </Button>
            </div>
          )
        }
      >
        {isLoading || !detail ? (
          <DrawerBodySkeleton />
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

      {modal === "restrict" && (
        <RestrictModal
          name={member.name}
          platformOnly={!demoMode}
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

/**
 * Live mode's `useAdminMember` fetches over the network, so the body/footer
 * sections that read `detail.*` need a placeholder for the gap between the
 * drawer opening and the detail arriving. Demo mode never renders this — its
 * `initialData` resolves instantly.
 */
function DrawerBodySkeleton() {
  return (
    <div aria-busy="true">
      <div className={styles.dSection}>
        <SkeletonLine width="40%" height={18} />
        <div className={styles.glanceGrid} style={{ marginTop: 10 }}>
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
        </div>
      </div>
      <div className={styles.dSection}>
        <SkeletonLine width="55%" height={18} />
        <SkeletonLine
          height={200}
          style={{ marginTop: 10, borderRadius: 16 }}
        />
      </div>
      <div className={styles.dSection}>
        <SkeletonLine width="70%" />
        <SkeletonLine width="90%" style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

function RemovePanel({
  body,
  onKeep,
  onContinue,
}: {
  body: string;
  onKeep: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.removePanel}>
      <p className={styles.removeTitle}>
        {t("admin:members.drawer.removePanel.title")}
      </p>
      <p className={styles.removeText}>{body}</p>
      <div className={styles.removeActions}>
        <Button variant="ghost" size="md" onClick={onKeep}>
          {t("admin:members.drawer.removePanel.keepCta")}
        </Button>
        <Button variant="danger" size="md" onClick={onContinue}>
          {t("admin:members.drawer.removePanel.continueCta")}
        </Button>
      </div>
    </div>
  );
}
