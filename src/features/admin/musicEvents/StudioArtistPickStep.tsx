import { useEffect, useMemo, useRef } from "react";
import {
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { describeError } from "../../../shared/api/errorMessage";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStaffMap } from "../../../shared/staff/useStaffRole";
import { InviteMembersListFooter } from "../../gatherings/InviteMembersListFooter";
import type { LineupPickStepProps } from "../../gatherings/eventHostScope";
import { useStudioArtistSearch } from "./api/useStudioArtistSearch";

/**
 * Step one of booking a lineup slot on a house music event: tap a Studio
 * artist, meaning an active member with a linked, listenable artist persona.
 * The search runs on the server across every page and its answer is shown
 * untouched, so connections and the going list never enter this picker. The
 * query lives in the parent so "Pick someone else" returns to what was typed.
 */
export function StudioArtistPickStep({
  excludeSlugs,
  searchQuery,
  onSearchChange,
  onPick,
  onClose,
}: LineupPickStepProps) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();
  const artistSearch = useStudioArtistSearch(searchQuery);
  const { people: artists, isSearchPending } = artistSearch;

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      artists.map((artist) => ({
        slug: artist.slug,
        name: artist.name,
        avatarUrl: artist.avatarUrl,
        detail: artist.detail
          ? t("admin:musicEvents.lineupPicker.personas", {
              names: artist.detail,
            })
          : undefined,
        staffRole: staffMap[artist.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[artist.slug]?.badgedStaffRoles,
      })),
    [artists, staffMap, t],
  );

  // Every artist the list has shown, so a row ticked under an earlier search
  // still resolves after the results move on.
  const everListedBySlug = useRef(new Map<string, MemberSelectPerson>());
  useEffect(() => {
    for (const person of people)
      everListedBySlug.current.set(person.slug, person);
  }, [people]);

  const pick = (candidateSlug: string) => {
    const person =
      people.find((candidate) => candidate.slug === candidateSlug) ??
      everListedBySlug.current.get(candidateSlug);
    if (person) onPick(person);
  };

  const isQueryTyped = searchQuery.trim() !== "";
  const excludedSlugs = new Set(excludeSlugs);
  const visibleCount = people.filter(
    (person) => !excludedSlugs.has(person.slug),
  ).length;
  const emptyMessage =
    artistSearch.isError && visibleCount === 0
      ? describeError(
          t("admin:musicEvents.lineupPicker.loadError"),
          artistSearch.error,
        )
      : isSearchPending
        ? undefined
        : people.length > 0 && visibleCount === 0
          ? t("admin:musicEvents.lineupPicker.allListed")
          : isQueryTyped
            ? t("admin:musicEvents.lineupPicker.empty", {
                query: searchQuery.trim(),
              })
            : undefined;

  return (
    <Modal
      eyebrow={t("gatherings:lineup.title")}
      title={t("admin:musicEvents.lineupPicker.title")}
      sub={t("admin:musicEvents.lineupPicker.sub")}
      onClose={onClose}
    >
      <MemberSelectList
        people={people}
        selected={new Set()}
        onToggle={pick}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t(
          "admin:musicEvents.lineupPicker.searchPlaceholder",
        )}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isSearching={isSearchPending && isQueryTyped}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("admin:musicEvents.lineupPicker.emptyAll")
        }
        emptyMessage={emptyMessage}
        listFooter={<InviteMembersListFooter connections={artistSearch} />}
      />
    </Modal>
  );
}
