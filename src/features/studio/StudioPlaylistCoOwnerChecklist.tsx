import { useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Collapse,
  CollapseListItem,
  LoadErrorState,
  SearchInput,
  SelectCheckMark,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistCandidateView,
  StudioPlaylistEditorView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import {
  useStudioPlaylistEditorCandidates,
  useStudioPlaylistEditors,
} from "./api/useStudioPlaylistEditors";
import {
  useInviteStudioPlaylistEditors,
  useRemoveStudioPlaylistEditor,
} from "./api/useStudioPlaylistEditorMutations";
import { editorRefusalTextOf } from "./studioPlaylistEditorRefusal";
import { StudioPlaylistPersonAvatar } from "./StudioPlaylistPersonAvatar";
import { StudioLine } from "./StudioSkeletons";
import css from "./StudioPlaylistEditors.module.css";

/** The search field shows once the first answer holds this many co-owners. */
const SEARCH_FROM_COUNT = 8;

/** One checklist row: a co-owner, or an editor who is no longer one. */
function CoOwnerRow({
  person,
  isChecked,
  isLocked,
  isBusy,
  onToggle,
}: {
  person: StudioPlaylistCandidateView["person"];
  isChecked: boolean;
  isLocked: boolean;
  isBusy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      aria-disabled={isLocked || undefined}
      aria-busy={isBusy || undefined}
      className={css.checkRow}
      onClick={() => {
        if (!isLocked) onToggle();
      }}
    >
      <span className={css.avatar} aria-hidden>
        <StudioPlaylistPersonAvatar person={person} size={32} />
      </span>
      <span className={css.name}>{person.name}</span>
      <SelectCheckMark isSelected={isChecked} />
    </button>
  );
}

/**
 * A persona-credited playlist's editors: a checklist of the persona's other
 * co-owners. Ticking picks one (active at once, since they
 * already share the persona); unticking ends their editing by the row's
 * editor id, read from the owner's editors list (candidates carry no id),
 * and their tracks stay. An active editor who is no longer a co-owner (the
 * grant was lost) still shows, ticked, so the owner can untick them. One
 * change runs at a time.
 */
export function StudioPlaylistCoOwnerChecklist({
  playlist,
}: {
  playlist: StudioPlaylistView;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasManyCoOwners, setHasManyCoOwners] = useState(false);
  const [busyRowKey, setBusyRowKey] = useState<string | null>(null);
  const { candidates, loadState, isSearchPending } =
    useStudioPlaylistEditorCandidates(playlist.id, searchQuery, {
      isEnabled: true,
    });
  const { editors } = useStudioPlaylistEditors(playlist.id, {
    isEnabled: true,
  });
  const invite = useInviteStudioPlaylistEditors();
  const removeEditor = useRemoveStudioPlaylistEditor();
  // Adjusting state while rendering: the field appears once and stays.
  if (!hasManyCoOwners && candidates.length >= SEARCH_FROM_COUNT)
    setHasManyCoOwners(true);
  const isReady = !loadState.isLoading && !loadState.isError;
  const isSearchTyped = searchQuery.trim() !== "";
  // Only the full, settled list can tell who dropped out of the co-owners.
  const candidateSlugs = new Set(
    candidates.map((candidate) => candidate.person.slug),
  );
  const lostEditors =
    isReady && !isSearchTyped && !isSearchPending
      ? editors.filter(
          (editor) =>
            !editor.isPending && !candidateSlugs.has(editor.person.slug),
        )
      : [];

  async function runChange(rowKey: string, change: () => Promise<void>) {
    if (busyRowKey !== null) return;
    setBusyRowKey(rowKey);
    try {
      await change();
    } catch (error) {
      // A refused pick names its reason, the same way the invite step does.
      const errorText = editorRefusalTextOf(error, {
        t,
        language,
        nameOf: (slug) =>
          candidates.find((candidate) => candidate.person.slug === slug)?.person
            .name ?? slug,
        personaName:
          playlist.credit.kind === "persona" ? playlist.credit.name : null,
      });
      showToast(errorText, "error");
    } finally {
      setBusyRowKey(null);
    }
  }

  async function endEditing(editorRow: StudioPlaylistEditorView) {
    await removeEditor.mutateAsync({
      playlistId: playlist.id,
      editorId: editorRow.editorId,
      memberSlug: editorRow.person.slug,
    });
    showToast(
      t("studio:playlist.editors.removedToast", {
        name: editorRow.person.name,
      }),
      "success",
    );
  }

  function toggle(candidate: StudioPlaylistCandidateView) {
    const memberSlug = candidate.person.slug;
    if (!memberSlug) return;
    void runChange(memberSlug, async () => {
      if (candidate.isEditor) {
        const editorRow = editors.find(
          (editor) => editor.person.slug === memberSlug,
        );
        // The editors list did not load, so there is no row id to end.
        if (!editorRow) {
          showToast(t("studio:playlist.editors.loadError"), "error");
          return;
        }
        await endEditing(editorRow);
        return;
      }
      await invite.mutateAsync({
        playlistId: playlist.id,
        memberSlugs: [memberSlug],
      });
      showToast(
        t("studio:playlist.editors.coOwners.addedToast", {
          name: candidate.person.name,
        }),
        "success",
      );
    });
  }

  return (
    <div className={css.panel}>
      <Collapse isOpen={hasManyCoOwners}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("studio:playlist.editors.coOwners.searchLabel")}
          ariaLabel={t("studio:playlist.editors.coOwners.searchLabel")}
          clearable
        />
      </Collapse>
      <Collapse isOpen={loadState.isLoading}>
        <div
          className={css.skeleton}
          role="status"
          aria-label={t("studio:playlist.editors.loadingLabel")}
        >
          <StudioLine width="60%" height={18} />
          <StudioLine width="45%" height={18} />
        </div>
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <LoadErrorState
          title={t("studio:playlist.editors.coOwners.loadError")}
          onRetry={loadState.retry}
          isRetrying={loadState.isRetrying}
          compact
        />
      </Collapse>
      <ul
        className={css.list}
        aria-label={t("studio:playlist.editors.coOwners.listLabel", {
          persona: playlist.credit.name,
        })}
      >
        <AnimatePresence initial={false}>
          {candidates.map((candidate) => (
            <CollapseListItem
              key={candidate.person.slug || candidate.person.name}
            >
              <CoOwnerRow
                person={candidate.person}
                isChecked={candidate.isEditor}
                isLocked={busyRowKey !== null || !candidate.person.slug}
                isBusy={busyRowKey === candidate.person.slug}
                onToggle={() => toggle(candidate)}
              />
            </CollapseListItem>
          ))}
          {lostEditors.map((editor) => (
            <CollapseListItem key={`lost-${editor.editorId}`}>
              <CoOwnerRow
                person={editor.person}
                isChecked
                isLocked={busyRowKey !== null}
                isBusy={busyRowKey === editor.editorId}
                onToggle={() =>
                  void runChange(editor.editorId, () => endEditing(editor))
                }
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse
        isOpen={
          isReady &&
          !isSearchPending &&
          candidates.length === 0 &&
          lostEditors.length === 0
        }
      >
        <p className={css.muted}>
          {isSearchTyped
            ? t("studio:playlist.editors.coOwners.noMatch")
            : t("studio:playlist.editors.coOwners.empty", {
                persona: playlist.credit.name,
              })}
        </p>
      </Collapse>
    </div>
  );
}
