import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiLock, FiUserMinus, FiUsers } from "react-icons/fi";
import { initialsFromName } from "../../shared/lib/initials";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import {
  getEndorsers,
  getFollowers,
  type EndorserDTO,
  type FollowerDTO,
} from "./api/subprofiles.api";
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
  /** Is the current viewer a co-owner (creator or invited member) of this
   *  persona? The owner-only signal that gates the followers list: only owners
   *  ever see who follows; everyone else gets the private state and no fetch.
   *  Flows straight through from `SubprofilePublicDTO.viewerIsMember`. */
  viewerIsMember: boolean;
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
  /** Row body under the name — pass a styled `.note` quote or `.noNote` micro
   *  label from the caller (composition over a config flag). Followers pass
   *  nothing, which keeps the row tight. */
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
          size={44}
        />
        <div className={styles.rowText}>
          <span className={styles.rowName}>{name}</span>
          {detail}
        </div>
      </Link>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.removeBtn}
          onClick={onRemove}
          disabled={removing}
          aria-label={t("subprofiles:peopleModal.removeAriaLabel", { name })}
        >
          <FiUserMinus aria-hidden />
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
 * - `"followers"`: OWNER-ONLY. Following stays anonymity-preserving for
 *   everyone else — a non-owner (live or demo) only ever sees the private
 *   state, and we never fetch. For the persona's own owner/co-owner
 *   (`viewerIsMember`), live reads the owner-only `getFollowers` endpoint (403
 *   for anyone else, so gated on `isOwner`), and demo shows the colocated
 *   illustrative pool (`subprofilePeopleModal.data.ts`) so demo mirrors live.
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
  const isOwner = persona.viewerIsMember;

  const { data: endorsersResult, isLoading: endorsersLoading } = useQuery({
    queryKey: ["subprofile", "endorsers", persona.id],
    queryFn: async ({
      signal,
    }): Promise<{ count: number; endorsers: EndorserDTO[] }> => {
      if (!demoMode) return getEndorsers(persona.id, signal);
      const { mockEndorsersById } = await import("./data/subprofiles.data");
      return mockEndorsersById(persona.id) ?? { count: 0, endorsers: [] };
    },
    enabled: mode === "endorsements" && Boolean(persona.id),
  });
  const endorsers = endorsersResult?.endorsers ?? [];

  // Followers are owner-only. LIVE hits the 403-guarded endpoint, so we never
  // enable the query for a non-owner. DEMO mirrors that gate so the two modes
  // behave identically.
  const { data: followersResult, isLoading: followersLoading } = useQuery({
    queryKey: ["subprofile", "followers", persona.id],
    queryFn: ({
      signal,
    }): Promise<{ count: number; followers: FollowerDTO[] }> =>
      getFollowers(persona.id, signal),
    enabled:
      mode === "followers" && isOwner && !demoMode && Boolean(persona.id),
  });
  const followers: FollowerDTO[] =
    mode === "followers" && isOwner
      ? demoMode
        ? demoFollowersFor(persona.id, persona.followerCount)
        : (followersResult?.followers ?? [])
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
    <ModalSheet onClose={onClose} ariaLabel={title}>
      <header className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.sub}>{persona.displayName}</p>
      </header>
      {mode === "endorsements" &&
        (endorsersLoading ? (
          <p className={styles.status}>
            {t("subprofiles:peopleModal.loading")}
          </p>
        ) : endorsers.length === 0 ? (
          <div className={styles.stateWrap}>
            <EmptyState title={t("subprofiles:peopleModal.noEndorsements")} />
          </div>
        ) : (
          <ul className={styles.list}>
            {endorsers.map((endorser) => (
              <PersonRow
                key={endorser.slug}
                slug={endorser.slug}
                name={endorser.name}
                avatarUrl={endorser.avatarUrl}
                detail={
                  endorser.note ? (
                    <blockquote className={styles.note}>
                      {endorser.note}
                    </blockquote>
                  ) : (
                    <span className={styles.noNote}>
                      {t("subprofiles:peopleModal.noNote")}
                    </span>
                  )
                }
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
        (!isOwner ? (
          <div className={styles.stateWrap}>
            <EmptyState
              icon={<FiLock aria-hidden />}
              title={t("subprofiles:peopleModal.followersPrivateTitle")}
              description={t("subprofiles:peopleModal.followersPrivateBody", {
                name: persona.displayName,
              })}
            />
          </div>
        ) : followersLoading ? (
          <p className={styles.status}>
            {t("subprofiles:peopleModal.loading")}
          </p>
        ) : followers.length === 0 ? (
          // An empty list with a POSITIVE count is not "no followers yet" — it's
          // the count-only/anonymity-preserving reality of live following: the
          // followers exist but aren't enumerable (backend returns the count,
          // not the rows). Show that explicitly instead of a misleading empty
          // state. `followerCount === 0` still reads as a genuine "no followers
          // yet". (Demo's `demoFollowersFor` always returns a populated list
          // when the count is positive, so this count-only branch is a live path.)
          <div className={styles.stateWrap}>
            {persona.followerCount > 0 ? (
              <EmptyState
                icon={<FiUsers aria-hidden />}
                title={t("subprofiles:peopleModal.followersCountOnlyTitle")}
                description={t("subprofiles:peopleModal.followersCountOnlyBody", {
                  count: persona.followerCount,
                  name: persona.displayName,
                })}
              />
            ) : (
              <EmptyState title={t("subprofiles:peopleModal.noFollowers")} />
            )}
          </div>
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
    </ModalSheet>
  );
}
