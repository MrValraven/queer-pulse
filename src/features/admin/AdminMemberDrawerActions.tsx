import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useVerifyMember } from "./api/useAdminMembers";
import { type AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/**
 * The member drawer's footer actions. Extracted from `AdminMemberDrawer` to
 * keep that component under the repo's 200-line limit.
 *
 * Verify + Restrict are wired to real backend endpoints
 * (`POST /admin/members/:id/verify` · `/restrict`, P2-3) in both modes via
 * demo-aware mutations. Message has no backend (it just opens the DM composer)
 * so it stays disabled-with-reason in live; demo keeps its functional
 * prototype.
 *
 * Verify owns its own mutation because nothing else in the drawer needs it;
 * Restrict/Ban only open a modal here, so the restriction mutation stays with
 * the drawer that applies it.
 */
export function AdminMemberDrawerActions({
  member,
  isRestrictPending,
  onMessage,
  onRestrict,
  onBan,
}: {
  member: AdminMember;
  isRestrictPending: boolean;
  onMessage: () => void;
  onRestrict: () => void;
  onBan: () => void;
}) {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const verifyMutation = useVerifyMember();

  return (
    <div className={styles.dFoot}>
      <Button
        variant="jade"
        size="md"
        // `member` is re-resolved from the roster each render, so once the
        // verify lands and the list refetches this button stays disabled
        // instead of inviting a second, duplicate call.
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
        title={demoMode ? undefined : t("admin:members.drawer.comingSoonToast")}
        onClick={onMessage}
      >
        {t("admin:members.drawer.messageCta")}
      </Button>
      <Button
        variant="ghost"
        size="md"
        disabled={isRestrictPending}
        onClick={onRestrict}
      >
        {t("admin:members.drawer.restrictCta")}
      </Button>
      <Button
        variant="danger"
        size="md"
        disabled={isRestrictPending}
        onClick={onBan}
      >
        {t("admin:members.drawer.banCta")}
      </Button>
    </div>
  );
}
