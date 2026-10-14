import { useId, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioCurationShelf,
} from "../studio/api/studio.types";
import {
  useAddAdminStudioPick,
  useAdminStudioReleaseSearch,
} from "./api/StudioAdminCurationHooks";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import {
  STUDIO_ADMIN_SHELF_LABEL_KEY,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import css from "./StudioAdminPage.module.css";
import { StudioAdminReleaseResults } from "./StudioAdminReleaseResults";

const SEARCH_DEBOUNCE_MS = 250;

/** Add a release to a shelf (or set the featured release): search
 *  published releases by title or artist, choose one, add an optional
 *  one-line note. */
export function StudioAdminPickDialog({
  shelf,
  takenReleaseIds,
  onClose,
}: {
  shelf: StudioCurationShelf;
  takenReleaseIds: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const searchFieldId = useId();
  const searchHintId = useId();
  const chooseErrorId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const takenIds = useMemo(() => new Set(takenReleaseIds), [takenReleaseIds]);
  const [isChooseMissing, setIsChooseMissing] = useState(false);
  const noteFieldId = useId();
  const noteHintId = useId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioReleaseSearch(debouncedQuery);
  const [chosen, setChosen] = useState<AdminStudioReleaseCardDTO | null>(null);
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const add = useAddAdminStudioPick();
  const shelfLabel = t(STUDIO_ADMIN_SHELF_LABEL_KEY[shelf]);
  const isFeatured = shelf === "featured";
  const results = search.data ?? [];
  const hasQuery = debouncedQuery.trim().length > 0;

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
        onSuccess: () => {
          showToast(
            t("admin:studioAdmin.toast.pickAdded", {
              title: chosen.title,
              shelf: shelfLabel,
            }),
            "success",
          );
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
        <label htmlFor={searchFieldId} className={css.fieldLabel}>
          {t("admin:studioAdmin.pickDialog.searchLabel")}
        </label>
        <input
          id={searchFieldId}
          ref={searchRef}
          type="search"
          className={css.textInput}
          value={query}
          maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
          aria-describedby={
            isChooseMissing ? `${searchHintId} ${chooseErrorId}` : searchHintId
          }
          aria-invalid={isChooseMissing || undefined}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p id={searchHintId} className={css.fieldHint}>
          {t("admin:studioAdmin.pickDialog.searchHint")}
        </p>
        <Collapse isOpen={isChooseMissing}>
          <p id={chooseErrorId} className={css.error} role="alert">
            {t("admin:studioAdmin.pickDialog.chooseFirst")}
          </p>
        </Collapse>
        <Collapse isOpen={hasQuery}>
          <StudioAdminReleaseResults
            results={results}
            isFetching={search.isFetching}
            isError={search.isError}
            chosenId={chosen?.id ?? null}
            takenIds={takenIds}
            onChoose={(release) => {
              setChosen(release);
              setIsChooseMissing(false);
              setErrorKey(null);
            }}
          />
        </Collapse>
        <Collapse isOpen={chosen !== null}>
          <p className={css.chosen}>
            {chosen
              ? t("admin:studioAdmin.pickDialog.chosen", {
                  title: chosen.title,
                })
              : null}
          </p>
        </Collapse>
        <label htmlFor={noteFieldId} className={css.fieldLabel}>
          {t("admin:studioAdmin.pickDialog.noteLabel")}
        </label>
        <input
          id={noteFieldId}
          type="text"
          className={css.textInput}
          value={note}
          maxLength={STUDIO_DISCOVERY_LIMITS.curationNoteMaxLength}
          aria-describedby={noteHintId}
          onChange={(event) => {
            setNote(event.target.value);
            setErrorKey(null);
          }}
        />
        <p id={noteHintId} className={css.fieldHint}>
          {t("admin:studioAdmin.pickDialog.noteHint")}
        </p>
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
