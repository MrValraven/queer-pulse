import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiLock, FiUserMinus } from "react-icons/fi";
import { initialsFromName } from "../../shared/lib/initials";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { getEndorsers, type EndorserDTO } from "./api/subprofiles.api";
import { useEndorsement } from "./api/useEndorsement";
import { demoFollowersFor } from "./subprofilePeopleModal.data";
import styles from "./SubprofilePeopleModal.module.css";

type PeopleModalMode = "followers" | "endorsements";

/** The minimal persona identity this modal needs — a narrow slice of
 *  `PublicSubprofileView`, kept local so the modal doesn't couple to the
 *  whole view model (Task 5 passes `view` directly; extra fields are
 *  structurally ignored). */
export interface PersonaPeopleSummary {
  id: string;
  displayName: string;
  endorsementCount: number;
  followerCount: number;
}

function PersonRow({
  slug,
  name,
  avatarUrl,
  detail,
  onRemove,
  removing,
}: {
  slug: string;
  name: string;
  avatarUrl: string | null;
  detail?: ReactNode;
  onRemove?: () => void;
  removing?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <li className={styles.row}>
      <Link className={styles.rowLink} to={`${routes.members}/${slug}`}>
        <Avatar
          initials={initialsFromName(name, "?")}
          src={avatarUrl ?? undefined}
          alt={name}
          tint="plum"
          size={40}
        />
        <div className={styles.rowText}>
          <span className={styles.rowName}>{name}</span>
          {detail && <span className={styles.rowDetail}>{detail}</span>}
        </div>
      </Link>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={removing}
          aria-label={t("subprofiles:peopleModal.removeAriaLabel", { name })}
        >
          <FiUserMinus aria-hidden />
          {t("subprofiles:peopleModal.removeCta")}
        </Button>
      )}
    </li>
  );
}

/**
 * Followers / endorsers list for one persona. Self-contained (own state, the
 * shared `Modal` handles scroll-lock/focus-trap/Esc). `mode` picks which list:
 *
 * - `"endorsements"`: live via `getEndorsers` (demo via `mockEndorsersById`) —
 *   the same query key `SubprofileEndorse` uses, so its cache is reused. Each
 *   row shows the endorser's quote or "Endorsed without a note"; the viewer
 *   can withdraw their OWN endorsement via `useEndorsement`.
 * - `"followers"`: DEMO-MODE NOTE — following has no live "list followers"
 *   endpoint at all (see `useFollow.ts`: following is deliberately
 *   count-only/anonymity-preserving — the backend only exposes a count +
 *   viewer-following toggle, never member identities). Demo mode shows a
 *   colocated illustrative pool (`subprofilePeopleModal.data.ts`); live mode
 *   renders an honest "kept private" state instead of fabricating names —
 *   TODO(product): if a real followers list is ever wanted, it needs a new
 *   backend endpoint + an explicit follower-visibility consent model, not a
 *   client-side workaround.
 *
 * Wired from `SubprofilePage` (Task 5): `SubprofileHero`'s `.pp-meta`
 * endorsements/followers buttons and the foot's "See all N" trigger
 * (`SubprofileAffiliations`) all call `onAction("people:endorsers"|
 * "people:followers")`, which the page host turns into mounting this modal
 * in the matching `mode`.
 */
export function SubprofilePeopleModal({
  persona,
  mode,
  onClose,
}: {
  persona: PersonaPeopleSummary;
  mode: PeopleModalMode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { withdraw } = useEndorsement(persona.id);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const viewerSlug = user?.profile.slug ?? null;

  const { data: endorsersResult, isLoading: endorsersLoading } = useQuery({
    queryKey: ["subprofile", "endorsers", persona.id],
    queryFn: async (): Promise<{ count: number; endorsers: EndorserDTO[] }> => {
      if (!demoMode) return getEndorsers(persona.id);
      const { mockEndorsersById } = await import("./data/subprofiles.data");
      return mockEndorsersById(persona.id) ?? { count: 0, endorsers: [] };
    },
    enabled: mode === "endorsements" && Boolean(persona.id),
  });
  const endorsers = endorsersResult?.endorsers ?? [];
  const followers =
    mode === "followers" && demoMode
      ? demoFollowersFor(persona.id, persona.followerCount)
      : [];

  async function removeEndorsement(endorserSlug: string) {
    if (withdraw.isPending) return;
    setRemovingSlug(endorserSlug);
    try {
      await withdraw.mutateAsync({
        currentEndorsementCount: persona.endorsementCount,
      });
    } catch {
      showToast(t("subprofiles:peopleModal.removeError"), "error");
    } finally {
      setRemovingSlug(null);
    }
  }

  const title =
    mode === "followers"
      ? t("subprofiles:peopleModal.followersTitle", {
          count: persona.followerCount,
        })
      : t("subprofiles:peopleModal.endorsementsTitle", {
          count: persona.endorsementCount,
        });

  return (
    <Modal title={title} onClose={onClose} sub={persona.displayName}>
      {mode === "endorsements" &&
        (endorsersLoading ? (
          <p className={styles.status}>
            {t("subprofiles:peopleModal.loading")}
          </p>
        ) : endorsers.length === 0 ? (
          <EmptyState compact title={t("subprofiles:peopleModal.noEndorsements")} />
        ) : (
          <ul className={styles.list}>
            {endorsers.map((endorser) => (
              <PersonRow
                key={endorser.slug}
                slug={endorser.slug}
                name={endorser.name}
                avatarUrl={endorser.avatarUrl}
                detail={endorser.note || t("subprofiles:peopleModal.noNote")}
                onRemove={
                  endorser.slug === viewerSlug
                    ? () => void removeEndorsement(endorser.slug)
                    : undefined
                }
                removing={removingSlug === endorser.slug}
              />
            ))}
          </ul>
        ))}

      {mode === "followers" &&
        (!demoMode ? (
          <EmptyState
            compact
            icon={<FiLock aria-hidden />}
            title={t("subprofiles:peopleModal.followersPrivateTitle")}
            description={t("subprofiles:peopleModal.followersPrivateBody")}
          />
        ) : followers.length === 0 ? (
          <EmptyState compact title={t("subprofiles:peopleModal.noFollowers")} />
        ) : (
          <ul className={styles.list}>
            {followers.map((follower) => (
              <PersonRow
                key={follower.slug}
                slug={follower.slug}
                name={follower.name}
                avatarUrl={follower.avatarUrl}
              />
            ))}
          </ul>
        ))}
    </Modal>
  );
}
