import { useMemo, useState } from "react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { Button, MemberSelectList } from "../../../../shared/components/ui";
import type { MemberSelectPerson } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { useStaffMap } from "../../../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../../../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "../../../gatherings/InviteMembersListFooter";
import {
  CO_MANAGER_SEAT_CAP,
  type ListingCoManagerDTO,
} from "../api/listingCoManagers.api";
import { useInviteCoManager } from "../api/useListingCoManagers";
import { coManagerInviteErrorKey } from "./coManagers.data";
import styles from "./CoManagers.module.css";

/**
 * The owner asking one member to help run their listing.
 *
 * The candidates are the owner's own connections, listed as soon as the panel
 * opens and searched on the server once typing pauses, with paging and a retry
 * at the end of the list. Demo mode takes the same path, since
 * `useConnectionsList` serves and searches the demo connections itself. People
 * already on the roster, and the owner, are hidden from the list.
 *
 * How many places are left is said BEFORE the picker, so the owner can plan
 * around the cap from the start. If a 409 still arrives (somebody else filled the last place, or the
 * person was invited from another tab), it is explained in words.
 */
export function CoManagerInvitePanel({
  listingRef,
  coManagers,
  ownerSlug,
}: {
  listingRef: string;
  /** The live roster, so taken places and already-listed members drop out. */
  coManagers: ListingCoManagerDTO[];
  /** The listing's owner, who can never be their own co-manager. */
  ownerSlug?: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const invite = useInviteCoManager(listingRef);

  // The pick is held as the whole person, captured at tap time, so it stays
  // on screen (pinned above the results) after a new search leaves it out.
  const [pickedPerson, setPickedPerson] = useState<MemberSelectPerson | null>(
    null,
  );
  // Everyone picked in this panel, by slug. An unticked pinned row stays on
  // screen until the query changes while the current results may leave it
  // out, so tapping it again resolves the person from here.
  const [earlierPicks, setEarlierPicks] = useState<
    Map<string, MemberSelectPerson>
  >(() => new Map());
  const [query, setQuery] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const excludeSlugs = useMemo(() => {
    const slugs: string[] = [];
    for (const coManager of coManagers) {
      if (coManager.member) slugs.push(coManager.member.slug);
    }
    if (ownerSlug) slugs.push(ownerSlug);
    return slugs;
  }, [coManagers, ownerSlug]);

  const staffMap = useStaffMap();
  const connectionsSearch = useConnectionsSearch(query);
  const { views: connections, isSearchPending } = connectionsSearch;
  const seatsUsed = coManagers.length;
  const isSeatCapReached = seatsUsed >= CO_MANAGER_SEAT_CAP;

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
        staffRole: staffMap[connection.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[connection.slug]?.badgedStaffRoles,
      })),
    [connections, staffMap],
  );

  // A pick who has since joined the roster no longer counts, so Send can only
  // ever reach a person still shown in the list.
  const activePick =
    pickedPerson && !excludeSlugs.includes(pickedPerson.slug)
      ? pickedPerson
      : null;
  const selected = useMemo(
    () => new Set(activePick ? [activePick.slug] : []),
    [activePick],
  );
  const pinnedPeople = useMemo(
    () => (activePick ? [activePick] : []),
    [activePick],
  );

  const toggle = (memberSlug: string) => {
    setErrorKey(null);
    if (activePick?.slug === memberSlug) {
      setPickedPerson(null);
      return;
    }
    // Single select: tapping somebody else replaces the pick.
    const person =
      people.find((candidate) => candidate.slug === memberSlug) ??
      earlierPicks.get(memberSlug);
    if (!person) return;
    setPickedPerson(person);
    if (!earlierPicks.has(person.slug)) {
      setEarlierPicks((previous) => new Map(previous).set(person.slug, person));
    }
  };

  const send = () => {
    if (!activePick) return;
    setErrorKey(null);
    invite.mutate(activePick.slug, {
      onSuccess: () => {
        setPickedPerson(null);
        setQuery("");
        showToast(
          t("marketing:listBusiness.coManagers.invitedToast"),
          "success",
        );
      },
      onError: (error) =>
        setErrorKey(coManagerInviteErrorKey(error, isSeatCapReached)),
    });
  };

  return (
    <div className={styles.invite}>
      <h3 className={styles.heading}>
        {t("marketing:listBusiness.coManagers.inviteHeading")}
      </h3>
      <p className={styles.intro}>
        {t("marketing:listBusiness.coManagers.inviteIntro")}
      </p>
      <p className={styles.seats}>
        {t("marketing:listBusiness.coManagers.seats", {
          used: format.number(seatsUsed),
          cap: format.number(CO_MANAGER_SEAT_CAP),
        })}
      </p>

      {isSeatCapReached ? (
        <p className={styles.notice} role="status">
          <span className={styles.noticeIcon} aria-hidden>
            <FiInfo />
          </span>
          {t("marketing:listBusiness.coManagers.seatsFullNotice")}
        </p>
      ) : (
        <>
          <div className={styles.picker}>
            <MemberSelectList
              people={people}
              selected={selected}
              onToggle={toggle}
              multiSelect={false}
              selectedIndicator="radio"
              pinnedPeople={pinnedPeople}
              excludeSlugs={excludeSlugs}
              searchQuery={query}
              onSearchChange={setQuery}
              isSearching={isSearchPending && query.trim() !== ""}
              emptyHint={
                isSearchPending
                  ? t("marketing:listBusiness.coManagers.loadingConnections")
                  : t("marketing:listBusiness.coManagers.noConnections")
              }
              emptyMessage={
                connectionsSearch.isError
                  ? t("marketing:listBusiness.coManagers.connectionsLoadError")
                  : !isSearchPending && people.length > 0
                    ? t("marketing:listBusiness.coManagers.allListedHelping")
                    : undefined
              }
              searchPlaceholder={t(
                "marketing:listBusiness.coManagers.searchPlaceholder",
              )}
              listFooter={
                <InviteMembersListFooter connections={connectionsSearch} />
              }
            />
          </div>
          <div className={styles.pickerFoot}>
            <Button
              onClick={send}
              disabled={selected.size === 0 || invite.isPending}
            >
              {invite.isPending
                ? t("marketing:listBusiness.coManagers.sendingCta")
                : t("marketing:listBusiness.coManagers.sendCta")}
            </Button>
          </div>
        </>
      )}

      {errorKey && (
        <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
          <span
            className={`${styles.noticeIcon} ${styles.noticeErrorIcon}`}
            aria-hidden
          >
            <FiAlertCircle />
          </span>
          {t(errorKey)}
        </p>
      )}
    </div>
  );
}
