import { useMemo, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import {
  Button,
  Collapse,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "../gatherings/InviteMembersListFooter";
import type {
  StudioPlaylistEditorView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import { STUDIO_PLAYLIST_LIMITS } from "./api/studio.types";
import { useInviteStudioPlaylistEditors } from "./api/useStudioPlaylistEditorMutations";
import { editorRefusalTextOf } from "./studioPlaylistEditorRefusal";
import css from "./StudioPlaylistEditors.module.css";

/**
 * Invite connections to edit a member-credited playlist. The server searches
 * every page of connections (useConnectionsSearch); a pick made under an
 * earlier search stays pinned and can be unticked and ticked again, because
 * the ever-picked map keeps everyone picked in this step. People who already
 * edit or hold an invite stay out of the pool, and the cap counts invited
 * plus active.
 */
export function StudioPlaylistEditorInviteStep({
  playlist,
  editors,
  onBack,
  onSent,
}: {
  playlist: StudioPlaylistView;
  editors: StudioPlaylistEditorView[];
  onBack: () => void;
  onSent: () => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const invite = useInviteStudioPlaylistEditors();
  const [searchQuery, setSearchQuery] = useState("");
  const [everPickedPeople, setEverPickedPeople] = useState<
    Map<string, MemberSelectPerson>
  >(() => new Map());
  const [pickedSlugs, setPickedSlugs] = useState<Set<string>>(() => new Set());
  const [errorText, setErrorText] = useState("");
  const [isErrorShown, setIsErrorShown] = useState(false);
  const excludeSlugs = useMemo(
    () =>
      editors.flatMap((editor) =>
        editor.person.slug ? [editor.person.slug] : [],
      ),
    [editors],
  );
  const freeSlots = Math.max(
    0,
    STUDIO_PLAYLIST_LIMITS.editorsMax - editors.length,
  );
  const activePicks = useMemo(() => {
    const excluded = new Set(excludeSlugs);
    return [...pickedSlugs].flatMap((pickedSlug) => {
      const person = everPickedPeople.get(pickedSlug);
      return person && !excluded.has(pickedSlug) ? [person] : [];
    });
  }, [pickedSlugs, everPickedPeople, excludeSlugs]);
  const selected = useMemo(
    () => new Set(activePicks.map((person) => person.slug)),
    [activePicks],
  );
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;
  const people = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
      })),
    [connections],
  );

  const toggle = (memberSlug: string) => {
    // A refusal speaks about the last send; any change to the picks ends it.
    setIsErrorShown(false);
    if (selected.has(memberSlug)) {
      setPickedSlugs((previous) => {
        const next = new Set(previous);
        next.delete(memberSlug);
        return next;
      });
      return;
    }
    // The current rows first, then anyone picked earlier in this step.
    const person =
      people.find((candidate) => candidate.slug === memberSlug) ??
      everPickedPeople.get(memberSlug);
    if (!person || selected.size >= freeSlots) return;
    setEverPickedPeople((previous) =>
      new Map(previous).set(memberSlug, person),
    );
    setPickedSlugs((previous) => new Set(previous).add(memberSlug));
  };

  function errorTextOf(error: unknown): string {
    return editorRefusalTextOf(error, {
      t,
      language,
      nameOf: (slug) => everPickedPeople.get(slug)?.name ?? slug,
      personaName:
        playlist.credit.kind === "persona" ? playlist.credit.name : null,
      pickedSlugs: selected,
    });
  }

  async function send() {
    if (selected.size === 0 || invite.isPending) return;
    setIsErrorShown(false);
    try {
      await invite.mutateAsync({
        playlistId: playlist.id,
        memberSlugs: [...selected],
      });
      showToast(
        t("studio:playlist.editors.invite.sentToast", { count: selected.size }),
        "success",
      );
      onSent();
    } catch (error) {
      setErrorText(errorTextOf(error));
      setIsErrorShown(true);
    }
  }

  return (
    <div className={css.panel}>
      <Button variant="quiet" size="sm" className={css.back} onClick={onBack}>
        <FiChevronLeft aria-hidden />
        {t("studio:playlist.editors.invite.backCta")}
      </Button>
      <MemberSelectList
        people={people}
        selected={selected}
        pinnedPeople={activePicks}
        onToggle={toggle}
        cap={freeSlots}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("studio:playlist.editors.invite.searchLabel")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("studio:playlist.editors.invite.loadingPeople")
            : t("studio:playlist.editors.invite.noConnections")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("studio:playlist.editors.invite.loadError")
            : !isSearchPending && people.length > 0
              ? t("studio:playlist.editors.invite.allListed")
              : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
      <Collapse isOpen={isErrorShown}>
        <p className={css.error} role="alert">
          {errorText}
        </p>
      </Collapse>
      <div className={css.foot}>
        <p className={css.muted}>
          {t("studio:playlist.editors.slotsUsed", {
            count: editors.length + selected.size,
            max: STUDIO_PLAYLIST_LIMITS.editorsMax,
          })}
        </p>
        <Button
          variant="primary"
          aria-disabled={selected.size === 0 || invite.isPending || undefined}
          aria-busy={invite.isPending || undefined}
          onClick={() => void send()}
        >
          {selected.size === 0
            ? t("studio:playlist.editors.invite.sendDefaultCta")
            : t("studio:playlist.editors.invite.sendCta", {
                count: selected.size,
              })}
        </Button>
      </div>
    </div>
  );
}
