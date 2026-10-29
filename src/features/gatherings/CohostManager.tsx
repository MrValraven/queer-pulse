import { useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { initialsFromName } from "../../shared/lib/initials";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MemberSelectPerson } from "../../shared/components/ui";
import { useEventHostScope } from "./eventHostScope";
import type { EventHostDTO } from "./api/events.api";
import { CohostInviteComposerModal } from "./CohostInviteComposerModal";
import {
  COHOST_TINTS,
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
  const scope = useEventHostScope();
  const AddDialog = scope.CohostAddDialog;
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

  // House scope: the add is immediate, so the person joins the list at once.
  const handleAdded = (person: MemberSelectPerson) => {
    setAddOpen(false);
    setCohosts((previous) =>
      previous.some((cohost) => cohost.slug === person.slug)
        ? previous
        : [
            ...previous,
            {
              slug: person.slug,
              name: person.name,
              role: t("gatherings:cohost.roleCohost"),
              initials: initialsFromName(person.name),
              tint: COHOST_TINTS[previous.length % COHOST_TINTS.length]!,
              photo: person.avatarUrl,
            },
          ],
    );
    showToast(
      t("admin:musicEvents.cohostAdd.addedToast", { name: person.name }),
      "success",
    );
  };

  const remove = (candidate: CohostCandidate) => {
    setConfirming(null);
    removeCohost.mutate(candidate.slug);
    setCohosts((previous) =>
      previous.filter((cohost) => cohost.slug !== candidate.slug),
    );
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
      <p className={styles.panelDesc}>
        {scope.isHouseEvent
          ? t("admin:musicEvents.house.cohostsNote")
          : t("gatherings:cohost.panelDesc")}
      </p>

      {cohosts.length === 0 ? (
        <div className={styles.empty}>{t("gatherings:cohost.emptyState")}</div>
      ) : (
        <div className={styles.cohostList}>
          {cohosts.map((cohost) => (
            <div className={styles.cohostRow} key={cohost.slug}>
              <Avatar
                initials={cohost.initials}
                tint={cohost.tint}
                src={cohost.photo}
                size={40}
              />
              <div className={styles.cohostInfo}>
                <div className={styles.cohostName}>
                  <span className={styles.nameRow}>
                    {cohost.name}
                    <MemberStaffBadge slug={cohost.slug} />
                  </span>
                </div>
                <div className={styles.cohostRole}>{cohost.role}</div>
              </div>
              {confirming === cohost.slug ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>
                    {t("gatherings:cohost.confirmPrompt")}
                  </span>
                  <Button variant="ghost" onClick={() => remove(cohost)}>
                    {t("gatherings:cohost.confirmYes")}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)}>
                    {t("gatherings:cohost.confirmKeep")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirming(cohost.slug)}
                  aria-label={t("gatherings:cohost.removeAria", {
                    name: cohost.name,
                  })}
                >
                  {t("gatherings:cohost.removeCta")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {addOpen && AddDialog && (
        <AddDialog
          slug={slug}
          excludeSlugs={cohosts.map((cohost) => cohost.slug)}
          onAdded={handleAdded}
          onClose={() => setAddOpen(false)}
        />
      )}
      {addOpen && !AddDialog && (
        <CohostInviteComposerModal
          slug={slug}
          excludeSlugs={cohosts.map((cohost) => cohost.slug)}
          onSent={handleInviteSent}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
