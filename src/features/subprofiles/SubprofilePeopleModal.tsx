import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiLock, FiUserMinus, FiUsers } from "react-icons/fi";
import { initialsFromName } from "../../shared/lib/initials";
import {
  Avatar,
  Button,
  EmptyState,
  LoadErrorState,
} from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { personaTitleName } from "./subprofile-kinds";
import type { SubprofileKind } from "./api/subprofiles.api";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { getFollowers, type FollowerDTO } from "./api/subprofiles.api";
import { useEndorsement } from "./api/useEndorsement";
import { useEndorsers } from "./api/useEndorsers";
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
  /** Kind + owner name let the modal title a persona still named after its
   *  profession as "Owner Name | Poet" (`personaTitleName`) instead of the bare
   *  "Poet". `ownerName` is absent for an unlinked persona, which then keeps its
   *  bare name — same anonymity rule as everywhere else. */
  kind: SubprofileKind;
  ownerName?: string;
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
  asVisitor = false,
  onClose,
}: {
  persona: PersonaPeopleSummary;
  mode: PeopleModalMode;
  /** Set while the owner reads their own persona as a visitor
   *  (`mode="visitor"` on the page). The stat buttons that open this modal
   *  stay live in that mode — a stranger can press them — so the modal has to
   *  answer as it would for a stranger: the followers list is owner-only, and
   *  showing the owner their own follower names inside a preview of the
   *  visitor's view would be the exact wrong answer. Drops the owner powers,
   *  which also stops the owner-only `getFollowers` fetch from firing. */
  asVisitor?: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { withdraw } = useEndorsement(persona.id);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const viewerSlug = user?.profile.slug ?? null;
  const isOwner = persona.viewerIsMember && !asVisitor;

  const {
    data: endorsersResult,
    isLoading: endorsersLoading,
    isError: haveEndorsersFailed,
    refetch: refetchEndorsers,
  } = useEndorsers(persona.id, mode === "endorsements");
  const endorsers = endorsersResult?.endorsers ?? [];

  // Followers are owner-only. LIVE hits the 403-guarded endpoint, so we never
  // enable the query for a non-owner. DEMO mirrors that gate so the two modes
  // behave identically.
  const {
    data: followersResult,
    isLoading: followersLoading,
    isError: haveFollowersFailed,
    refetch: refetchFollowers,
  } = useQuery({
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

  const personaName = personaTitleName({
    displayName: persona.displayName,
    kind: persona.kind,
    ownerName: persona.ownerName,
  });
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
        <p className={styles.sub}>{personaName}</p>
      </header>
      {mode === "endorsements" &&
        (endorsersLoading ? (
          <p className={styles.status}>
            {t("subprofiles:peopleModal.loading")}
          </p>
        ) : haveEndorsersFailed ? (
          /* A failed fetch must not read as "nobody has endorsed this
             persona" (DES-22). */
          <div className={styles.stateWrap}>
            <LoadErrorState compact onRetry={() => void refetchEndorsers()} />
          </div>
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
                name: personaName,
              })}
            />
          </div>
        ) : followersLoading ? (
          <p className={styles.status}>
            {t("subprofiles:peopleModal.loading")}
          </p>
        ) : haveFollowersFailed ? (
          <div className={styles.stateWrap}>
            <LoadErrorState compact onRetry={() => void refetchFollowers()} />
          </div>
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
                description={t(
                  "subprofiles:peopleModal.followersCountOnlyBody",
                  {
                    count: persona.followerCount,
                    name: personaName,
                  },
                )}
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
