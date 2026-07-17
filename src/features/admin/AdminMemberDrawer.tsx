import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { AdminDrawer, AdminAvatar, AdminChip } from "./ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminVouchGraphModal } from "./AdminVouchGraphModal";
import { personIdByInitials } from "./adminVouchGraph.data";
import {
  MemberOverviewSections,
  ModerationTimeline,
  SealedIdentity,
} from "./AdminMemberDrawerSections";
import { MessageModal, RestrictModal } from "./AdminMemberModals";
import { portrait } from "./adminPeople.data";
import { detailFor, type AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

interface Props {
  member: AdminMember;
  onClose: () => void;
}

const firstName = (full: string) => full.split(" ")[0];

export function AdminMemberDrawer({ member, onClose }: Props) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [modal, setModal] = useState<"message" | "restrict" | "network" | null>(
    null,
  );
  const detail = detailFor(member);
  const first = firstName(member.name);
  const focusId = personIdByInitials(member.initials);

  return (
    <>
      {/* drawer + its modals */}
      <AdminDrawer
        label={`${member.name} — member detail`}
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
          confirming ? (
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
              <Button
                variant="jade"
                size="md"
                onClick={() =>
                  showToast(
                    t("admin:members.drawer.verifiedToast", {
                      name: member.name,
                    }),
                    "success",
                  )
                }
              >
                {t("admin:members.drawer.verifyCta")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setModal("message")}
              >
                {t("admin:members.drawer.messageCta")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setModal("restrict")}
              >
                {t("admin:members.drawer.restrictCta")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => setConfirming(true)}
              >
                {t("admin:members.drawer.removeCta")}
              </Button>
            </div>
          )
        }
      >
        <MemberOverviewSections
          detail={detail}
          focusId={focusId}
          onOpenNetwork={() => setModal("network")}
        />

        <ModerationTimeline entries={detail.moderationTimeline} />

        <SealedIdentity />
      </AdminDrawer>

      {modal === "network" && (
        <AdminVouchGraphModal
          focusId={focusId}
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
          onClose={() => setModal(null)}
          onMissingReason={() =>
            showToast(
              t("admin:members.drawer.missingReasonToast", { name: first }),
              "error",
            )
          }
          onApply={(durationLabel, scopeLabel) => {
            setModal(null);
            onClose();
            showToast(
              t("admin:members.drawer.restrictedToast", {
                name: first,
                duration: durationLabel,
                scope: scopeLabel,
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
          }}
        />
      )}
    </>
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
