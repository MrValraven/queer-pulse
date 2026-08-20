import { useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { EventHostDTO } from "./api/events.api";
import { CohostInviteComposerModal } from "./CohostInviteComposerModal";
import {
  INITIAL_COHOSTS,
  hostDtoToCandidate,
  type CohostCandidate,
} from "./manageCohosts.data";
import { useRemoveCohost } from "./api/useEventMutations";
import styles from "./ManageCohosts.module.css";

/**
 * Lists the event's cohosts and lets the host add/remove them. Owns the cohost
 * list as local state (seeded once, then mutated optimistically): the
 * add/remove mutations are a no-op in demo and a real call + invalidate in
 * live. Demo seeds the mock cohosts; live seeds the real roster the parent
 * already fetched off `GET /events/:slug` (`EventDetail.cohosts` — no second
 * request needed).
 */
export function CohostManager({
  slug,
  cohosts: liveCohosts,
}: {
  slug: string;
  /** The event's real accepted co-hosts (`GatheringDetail.cohosts`), or
   *  `undefined` in demo mode / before the detail has loaded. */
  cohosts?: EventHostDTO[];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const removeCohost = useRemoveCohost(slug);
  const [cohosts, setCohosts] = useState<CohostCandidate[]>(() =>
    demoMode
      ? INITIAL_COHOSTS
      : (liveCohosts ?? []).map((dto, index) =>
          hostDtoToCandidate(dto, index, t("gatherings:cohost.roleCohost")),
        ),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleInviteSent = (name: string) => {
    setAddOpen(false);
    showToast(t("gatherings:cohost.inviteSentToast", { name }), "success");
  };

  const remove = (candidate: CohostCandidate) => {
    setConfirming(null);
    removeCohost.mutate(candidate.slug);
    setCohosts((prev) => prev.filter((c) => c.slug !== candidate.slug));
    showToast(
      t("gatherings:cohost.removedToast", { name: candidate.name }),
      "info",
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelTitle}>
          {t("gatherings:cohost.panelTitle")}
        </div>
        <Button variant="ghost" onClick={() => setAddOpen(true)}>
          {t("gatherings:cohost.addCta")}
        </Button>
      </div>
      <p className={styles.panelDesc}>{t("gatherings:cohost.panelDesc")}</p>

      {cohosts.length === 0 ? (
        <div className={styles.empty}>{t("gatherings:cohost.emptyState")}</div>
      ) : (
        <div className={styles.cohostList}>
          {cohosts.map((c) => (
            <div className={styles.cohostRow} key={c.slug}>
              <Avatar
                initials={c.initials}
                tint={c.tint}
                src={c.photo}
                size={40}
              />
              <div className={styles.cohostInfo}>
                <div className={styles.cohostName}>
                  <span className={styles.nameRow}>
                    {c.name}
                    <MemberStaffBadge slug={c.slug} />
                  </span>
                </div>
                <div className={styles.cohostRole}>{c.role}</div>
              </div>
              {confirming === c.slug ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>
                    {t("gatherings:cohost.confirmPrompt")}
                  </span>
                  <Button variant="ghost" onClick={() => remove(c)}>
                    {t("gatherings:cohost.confirmYes")}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)}>
                    {t("gatherings:cohost.confirmKeep")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirming(c.slug)}
                  aria-label={t("gatherings:cohost.removeAria", {
                    name: c.name,
                  })}
                >
                  {t("gatherings:cohost.removeCta")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <CohostInviteComposerModal
          slug={slug}
          excludeSlugs={cohosts.map((c) => c.slug)}
          onSent={handleInviteSent}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
