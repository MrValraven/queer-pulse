import { useId, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCurationShelf } from "../studio/api/studio.types";
import { useAddAdminStudioPick } from "./api/StudioAdminCurationHooks";
import type {
  AdminStudioPickDTO,
  AdminStudioReleaseCardDTO,
} from "./api/studioDiscoveryAdmin.api";
import {
  STUDIO_ADMIN_SHELF_LABEL_KEY,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import { StudioAdminChosenRelease } from "./StudioAdminChosenRelease";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import css from "./StudioAdminPickDialog.module.css";
import { StudioAdminReleaseResults } from "./StudioAdminReleaseResults";
import { StudioAdminReleaseSearchField } from "./StudioAdminReleaseSearchField";
import { useStudioAdminReleaseBrowse } from "./useStudioAdminReleaseBrowse";

/** Add a release to a shelf (or set the featured release): browse the
 *  newest published releases or search them by title or artist, choose
 *  one, add an optional one-line note. Choosing folds the results away and
 *  the chosen card takes their place; typing again or "Choose another
 *  release" brings them back. On the featured shelf, a set
 *  `currentFeatured` adds a line under the card naming the release this
 *  one replaces. `onAdded` hears the created pick before the dialog closes. */
export function StudioAdminPickDialog({
  shelf,
  takenReleaseIds,
  onClose,
  onAdded,
  currentFeatured = null,
}: {
  shelf: StudioCurationShelf;
  takenReleaseIds: string[];
  onClose: () => void;
  onAdded?: (pick: AdminStudioPickDTO) => void;
  currentFeatured?: AdminStudioPickDTO | null;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const chooseErrorId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const takenIds = useMemo(() => new Set(takenReleaseIds), [takenReleaseIds]);
  const [isChooseMissing, setIsChooseMissing] = useState(false);
  const [query, setQuery] = useState("");
  const browse = useStudioAdminReleaseBrowse(query);
  const [chosen, setChosen] = useState<AdminStudioReleaseCardDTO | null>(null);
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const add = useAddAdminStudioPick();
  const shelfLabel = t(STUDIO_ADMIN_SHELF_LABEL_KEY[shelf]);
  const isFeatured = shelf === "featured";
  // The line shows once a release is chosen; choosing the featured one
  // itself replaces nothing, and the save names that refusal.
  const isReplacing =
    isFeatured &&
    currentFeatured != null &&
    chosen != null &&
    chosen.id !== currentFeatured.release.id;

  function clearChoice() {
    setChosen(null);
    setErrorKey(null);
  }

  function submit() {
    if (add.isPending) return;
    if (!chosen) {
      setIsChooseMissing(true);
      searchRef.current?.focus();
      return;
    }
    const trimmedNote = note.trim();
    add.mutate(
      { shelf, release: chosen, note: trimmedNote || null },
      {
        onSuccess: (pick) => {
          showToast(
            t("admin:studioAdmin.toast.pickAdded", {
              title: chosen.title,
              shelf: shelfLabel,
            }),
            "success",
          );
          onAdded?.(pick);
          onClose();
        },
        onError: (cause) => setErrorKey(studioAdminSaveErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      title={
        isFeatured
          ? t("admin:studioAdmin.pickDialog.titleFeatured")
          : t("admin:studioAdmin.pickDialog.title", { shelf: shelfLabel })
      }
      onClose={onClose}
      initialFocusRef={searchRef}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={add.isPending || undefined}
            aria-busy={add.isPending || undefined}
            onClick={submit}
          >
            {t(
              isFeatured
                ? "admin:studioAdmin.pickDialog.submitFeaturedCta"
                : "admin:studioAdmin.pickDialog.submitCta",
            )}
          </Button>
        </>
      }
    >
      <form
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <StudioAdminReleaseSearchField
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (chosen) clearChoice();
          }}
          inputRef={searchRef}
          isInvalid={isChooseMissing}
          describedByExtra={chooseErrorId}
        />
        <Collapse isOpen={isChooseMissing}>
          <p id={chooseErrorId} className={css.error} role="alert">
            {t("admin:studioAdmin.pickDialog.chooseFirst")}
          </p>
        </Collapse>
        <Collapse isOpen={chosen === null}>
          <StudioAdminReleaseResults
            results={browse.results}
            isBlankTerm={browse.isBlankTerm}
            isLoading={browse.isLoading}
            isRefreshing={browse.isRefreshing}
            isPaused={browse.isPaused}
            isError={browse.isError}
            error={browse.error}
            onRetry={browse.retry}
            chosenId={chosen?.id ?? null}
            takenIds={takenIds}
            takenLabel={t(
              isFeatured
                ? "admin:studioAdmin.pickDialog.takenFeatured"
                : "admin:studioAdmin.pickDialog.takenOnShelf",
            )}
            onChoose={(release) => {
              setChosen(release);
              setIsChooseMissing(false);
              setErrorKey(null);
            }}
          />
        </Collapse>
        <StudioAdminChosenRelease
          chosen={chosen}
          replacedTitle={
            isReplacing ? (currentFeatured?.release.title ?? null) : null
          }
          onChange={() => {
            clearChoice();
            searchRef.current?.focus();
          }}
        />
        <StudioAdminNoteField
          value={note}
          onChange={(value) => {
            setNote(value);
            setErrorKey(null);
          }}
        />
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
