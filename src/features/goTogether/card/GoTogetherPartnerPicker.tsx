import { useId, useMemo, useState } from "react";
import {
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useConnectionsSearch } from "../../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "../../gatherings/InviteMembersListFooter";
import { useMemberProfile } from "../../members/api/useMemberProfile";
import { fullName } from "../../members/data/members";
import styles from "./GoTogetherCard.module.css";

/**
 * Pick the one connection to go with. The search runs on the server across
 * every page of connections, the same path as the cohost picker
 * (`CohostInvitePickStep`), so a friend past the first page is reachable by
 * name or through "Load more". Demo mode takes the same path, since
 * `useConnectionsList` serves and searches the demo connections itself. The
 * server checks that the friend is also going; a refusal comes back as
 * `GO_TOGETHER_PARTNER_UNAVAILABLE` and the card says so.
 */
export function GoTogetherPartnerPicker({
  partnerSlug,
  onPartnerChange,
}: {
  partnerSlug: string | null;
  onPartnerChange: (partnerSlug: string | null) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const [searchQuery, setSearchQuery] = useState("");
  // The friend as they were when tapped, so the chosen row stays on screen
  // after a search that no longer returns them.
  const [pickedPartner, setPickedPartner] = useState<MemberSelectPerson | null>(
    null,
  );
  // Everyone tapped while this picker is open, by slug. An unticked pinned
  // row can stay on screen under a search that never returned it, so ticking
  // it again has to find the person somewhere other than the current rows.
  const [tappedPeople, setTappedPeople] = useState<
    ReadonlyMap<string, MemberSelectPerson>
  >(() => new Map());
  // A partner chosen before this picker mounted (editing an opt-in, or
  // leaving "With a friend" and coming back) has no tap to remember, so the
  // profile is looked up once to pin them.
  const isPickCurrent =
    pickedPartner !== null && pickedPartner.slug === partnerSlug;
  const earlierProfile = useMemberProfile(
    isPickCurrent ? undefined : (partnerSlug ?? undefined),
  );
  const earlierMember = earlierProfile.data?.member ?? null;
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;

  const results = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
      })),
    [connections],
  );
  const pinnedPeople = useMemo<MemberSelectPerson[]>(() => {
    if (pickedPartner !== null && pickedPartner.slug === partnerSlug)
      return [pickedPartner];
    if (partnerSlug === null || !earlierMember) return [];
    return [
      {
        // The query is keyed by this slug, so its answer is this person.
        slug: partnerSlug,
        name: fullName(earlierMember),
        avatarUrl: earlierMember.photo,
        pronouns: earlierMember.pronouns,
      },
    ];
  }, [pickedPartner, partnerSlug, earlierMember]);
  const selected = useMemo(
    () => new Set(partnerSlug ? [partnerSlug] : []),
    [partnerSlug],
  );

  const toggle = (candidateSlug: string) => {
    const tappedPerson =
      results.find((person) => person.slug === candidateSlug) ??
      tappedPeople.get(candidateSlug) ??
      pinnedPeople.find((person) => person.slug === candidateSlug);
    if (tappedPerson)
      setTappedPeople((previous) =>
        new Map(previous).set(candidateSlug, tappedPerson),
      );
    if (candidateSlug === partnerSlug) {
      setPickedPartner(null);
      onPartnerChange(null);
      return;
    }
    setPickedPartner(tappedPerson ?? null);
    onPartnerChange(candidateSlug);
  };

  return (
    <section className={styles.step} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.stepTitle}>
        {t("goTogether:card.partner.title")}
      </h3>
      <p className={styles.stepHint}>{t("goTogether:card.partner.hint")}</p>
      <MemberSelectList
        people={results}
        pinnedPeople={pinnedPeople}
        selected={selected}
        multiSelect={false}
        selectedIndicator="radio"
        onToggle={toggle}
        searchPlaceholder={t("goTogether:card.partner.search")}
        searchAriaLabel={t("goTogether:card.partner.search")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("goTogether:card.partner.loading")
            : t("goTogether:card.partner.empty")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("goTogether:card.partner.loadError")
            : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
    </section>
  );
}
