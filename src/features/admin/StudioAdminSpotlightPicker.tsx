import { useId, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useAddAdminStudioNewStar,
  useSetAdminStudioArtistOfTheMonth,
} from "./api/StudioAdminSpotlightMutations";
import type {
  AdminStudioSpotlightArtistOptionDTO,
  StudioSpotlightSlot,
} from "./api/studioSpotlightAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import {
  STUDIO_SPOTLIGHT_SLOT_TITLE_KEY,
  STUDIO_SPOTLIGHT_SUBMIT_KEY,
} from "./studioAdminSpotlight.model";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import { StudioAdminSpotlightSearch } from "./StudioAdminSpotlightSearch";
import css from "./StudioAdminSpotlight.module.css";

const SAVED_TOAST_KEY: Record<StudioSpotlightSlot, string> = {
  artist_of_the_month: "admin:studioAdmin.spotlight.monthSet",
  new_stars: "admin:studioAdmin.spotlight.addedToNewStars",
};

/** Choose a Studio artist for a spotlight slot, with an optional note. The
 *  month slot replaces the current pick; New stars adds them last. Enter in
 *  the note field saves, through the footer's submit button. `onSaved` runs
 *  after a save, for a caller whose opener goes away with it. */
export function StudioAdminSpotlightPicker({
  slot,
  takenArtistIds,
  onSaved,
  onClose,
}: {
  slot: StudioSpotlightSlot;
  takenArtistIds: ReadonlySet<string>;
  onSaved?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] =
    useState<AdminStudioSpotlightArtistOptionDTO | null>(null);
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const setMonth = useSetAdminStudioArtistOfTheMonth();
  const addStar = useAddAdminStudioNewStar();
  const save = slot === "artist_of_the_month" ? setMonth : addStar;

  function submit() {
    if (save.isPending) return;
    if (!chosen) {
      setErrorKey("admin:studioAdmin.spotlight.chooseFirst");
      return;
    }
    save.mutate(
      { option: chosen, note: note.trim() || null },
      {
        onSuccess: () => {
          showToast(
            t(SAVED_TOAST_KEY[slot], { name: chosen.artist.name }),
            "success",
          );
          onSaved?.();
          onClose();
        },
        onError: (cause) => setErrorKey(studioAdminSaveErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      title={t(STUDIO_SPOTLIGHT_SLOT_TITLE_KEY[slot])}
      onClose={onClose}
      initialFocusRef={searchInputRef}
      shouldCollapseSubWithKeyboard
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            aria-disabled={save.isPending || undefined}
            aria-busy={save.isPending || undefined}
          >
            {t(STUDIO_SPOTLIGHT_SUBMIT_KEY[slot])}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <StudioAdminSpotlightSearch
          slot={slot}
          takenArtistIds={takenArtistIds}
          chosenArtistId={chosen?.artist.id ?? null}
          inputRef={searchInputRef}
          onChoose={(option) => {
            setChosen(option);
            setErrorKey(null);
          }}
        />
        <Collapse isOpen={chosen !== null}>
          <p className={css.chosen}>
            {t("admin:studioAdmin.spotlight.chosen", {
              name: chosen?.artist.name ?? "",
            })}
          </p>
        </Collapse>
        <StudioAdminNoteField
          value={note}
          onChange={setNote}
          hintKey="admin:studioAdmin.spotlight.noteHint"
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
