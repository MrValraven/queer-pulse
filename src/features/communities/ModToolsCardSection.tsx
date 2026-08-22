import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardProgram, useUpsertCardProgram } from "../cards/api/useCardProgram";
import { MembershipCardFace } from "../cards/MembershipCardFace";
import { CardDesignerModal } from "../cards/CardDesignerModal";
import { CardHoldersPanel } from "../cards/CardHoldersPanel";
import { previewCard } from "../cards/cardDesigner.data";
import type { CommunityRole } from "./membership.types";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsCardSection.module.css";

/**
 * Entry point for a community's membership-card programme, in Mod tools.
 * Owner/mod-only, mirroring `CommunityDangerZone`'s `role`-prop gate — this
 * whole section only ever mounts inside `ModToolsTab`, which itself only
 * renders for an owner/mod (`LivingHubTabs`'s `isMod` gate), so this is a
 * defensive second read of the same `role`, not a new permission source.
 *
 * No programme yet: a short explainer plus a primary CTA that opens the
 * designer. A programme already exists: the current card's live preview plus
 * a ghost "Edit card" CTA that reopens the same designer pre-filled.
 */
export function ModToolsCardSection({
  slug,
  communityName,
  role,
}: {
  slug: string;
  communityName: string;
  role: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isStaff = role === "owner" || role === "mod";
  const { program, isLoading } = useCardProgram(slug);
  const upsert = useUpsertCardProgram(slug);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);

  if (!isStaff) return null;

  // A programme row that exists but is disabled is still "started" — it must
  // keep showing its preview, edit, and resume controls rather than falling
  // back to the empty "start a card" state, or a pause would be a one-way
  // door with no way back in the product (spec §D.5 names enable AND disable
  // as the pair of auditable card powers).
  const hasProgram = Boolean(program);
  const isEnabled = Boolean(program?.isEnabled);

  const togglePause = () => {
    if (!program || upsert.isPending) return;
    const nextEnabled = !program.isEnabled;
    upsert.mutate(
      {
        isEnabled: nextEnabled,
        skin: program.skin,
        accentToken: program.accentToken,
        cardName: program.cardName,
        validityMonths: program.validityMonths,
        allowsPublicBadge: program.allowsPublicBadge,
      },
      {
        onSuccess: () =>
          showToast(
            t(
              nextEnabled
                ? "cards:modTools.resumedToast"
                : "cards:modTools.pausedToast",
            ),
          ),
        onError: () => showToast(t("common:toast.saveFailed"), "error"),
      },
    );
  };

  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        <FiCreditCard aria-hidden /> {t("cards:modTools.title")}
      </div>

      {isLoading ? (
        <SkeletonLine height={140} style={{ borderRadius: 22 }} />
      ) : hasProgram && program ? (
        <>
          <div className={styles.existing}>
            <div className={styles.previewSlot}>
              <MembershipCardFace
                card={previewCard(
                  communityName,
                  program.cardName,
                  program.skin,
                  program.accentToken,
                )}
                isActive={false}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDesignerOpen(true)}
            >
              {t("cards:modTools.edit")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              disabled={upsert.isPending}
            >
              {isEnabled
                ? t("cards:modTools.pause")
                : t("cards:modTools.resume")}
            </Button>
          </div>
          {!isEnabled && (
            <p className={styles.pausedNotice}>
              {t("cards:modTools.pausedNotice")}
            </p>
          )}
          <div className={styles.holders}>
            <CardHoldersPanel slug={slug} />
          </div>
        </>
      ) : (
        <EmptyState
          compact
          icon={<FiCreditCard />}
          title={t("cards:modTools.title")}
          description={t("cards:modTools.empty")}
          action={{
            label: t("cards:modTools.start"),
            onClick: () => setIsDesignerOpen(true),
          }}
        />
      )}

      {isDesignerOpen && (
        <CardDesignerModal
          slug={slug}
          communityName={communityName}
          onClose={() => setIsDesignerOpen(false)}
        />
      )}
    </>
  );
}
