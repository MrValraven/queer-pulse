import { useMemo, useState } from "react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { Button, MemberSelectList } from "../../../../shared/components/ui";
import type { MemberSelectPerson } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { useStrangerMemberSearch } from "../../../messages/api/useStrangerMemberSearch";
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
 * Search reaches every member rather than the owner's own connections: the
 * person who runs a bar with you is not necessarily somebody you follow here.
 *
 * How many places are left is said BEFORE the picker, so the cap is something
 * an owner plans around instead of something they discover when the send is
 * refused. If a 409 still arrives (somebody else filled the last place, or the
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

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const takenSlugs = useMemo(() => {
    const slugs = new Set<string>();
    for (const coManager of coManagers) {
      if (coManager.member) slugs.add(coManager.member.slug);
    }
    if (ownerSlug) slugs.add(ownerSlug);
    return slugs;
  }, [coManagers, ownerSlug]);

  const { results, loading } = useStrangerMemberSearch(query, takenSlugs);
  const seatsUsed = coManagers.length;
  const isSeatCapReached = seatsUsed >= CO_MANAGER_SEAT_CAP;

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      results.map((result) => ({
        slug: result.slug,
        name: result.name,
        avatarUrl: result.avatarUrl,
        pronouns: result.sub,
      })),
    [results],
  );

  const toggle = (memberSlug: string) => {
    setErrorKey(null);
    setSelected((previous) =>
      previous.has(memberSlug) ? new Set() : new Set([memberSlug]),
    );
  };

  const send = () => {
    const [memberSlug] = [...selected];
    if (!memberSlug) return;
    setErrorKey(null);
    invite.mutate(memberSlug, {
      onSuccess: () => {
        setSelected(new Set());
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
              searchQuery={query}
              onSearchChange={setQuery}
              isSearching={loading}
              emptyHint={t("marketing:listBusiness.coManagers.searchHint")}
              searchPlaceholder={t(
                "marketing:listBusiness.coManagers.searchPlaceholder",
              )}
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
