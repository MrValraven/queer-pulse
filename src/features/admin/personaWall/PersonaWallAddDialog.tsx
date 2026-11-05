import { useId, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PERSONA_WALL_SEARCH_MAX_LENGTH,
  type PersonaWallPersonaDTO,
} from "../../subprofiles/api/personaWall.api";
import { usePersonaWallCandidateSearch } from "../api/useAdminPersonaWall";
import {
  useAddPersonaWallPick,
  usePersonaWallIsWriting,
} from "../api/useAdminPersonaWallMutations";
import pickCss from "../StudioAdminPickDialog.module.css";
import {
  PERSONA_WALL_ERROR_VALUES,
  personaWallErrorKeyOf,
} from "./personaWallAdmin.model";
import { PersonaWallSearchResults } from "./PersonaWallSearchResults";
import css from "./PersonaWallAddDialog.module.css";

/** Add a persona: search the listed directory by name, then press a result
 *  to put it at the end of the wall. A success shows a toast and closes the
 *  dialog; a refusal stays under the results and names its cause. */
export function PersonaWallAddDialog({
  isFull,
  onClose,
}: {
  isFull: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const searchId = useId();
  const searchHintId = useId();
  const fullHintId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  // The last refusal line stays after the alert folds away, so the fold
  // animation still shows the real words.
  const [lastErrorKey, setLastErrorKey] = useState<string | null>(null);
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would send two adds.
  const isSendingRef = useRef(false);
  const search = usePersonaWallCandidateSearch(query);
  const addPick = useAddPersonaWallPick();
  const isWriting = usePersonaWallIsWriting();
  const isBusy = addPick.isPending || isWriting;

  function choose(persona: PersonaWallPersonaDTO) {
    if (isBusy || isSendingRef.current) return;
    isSendingRef.current = true;
    setErrorKey(null);
    addPick.mutate(
      { subprofileId: persona.id },
      {
        onSuccess: () => {
          showToast(
            t("admin:personaWall.toast.added", { name: persona.displayName }),
            "success",
          );
          onClose();
        },
        onError: (cause) => {
          const refusalKey = personaWallErrorKeyOf(cause);
          setErrorKey(refusalKey);
          setLastErrorKey(refusalKey);
        },
        onSettled: () => {
          isSendingRef.current = false;
        },
      },
    );
  }

  return (
    <Modal
      title={t("admin:personaWall.addDialog.title")}
      onClose={onClose}
      initialFocusRef={searchRef}
      wide
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("admin:common.cancel")}
        </Button>
      }
    >
      <div className={pickCss.dialogForm}>
        <div className={pickCss.field}>
          <label htmlFor={searchId} className={pickCss.fieldLabel}>
            {t("admin:personaWall.addDialog.searchLabel")}
          </label>
          <div className={pickCss.searchShell}>
            <FiSearch className={pickCss.searchIcon} aria-hidden />
            <input
              id={searchId}
              ref={searchRef}
              type="search"
              className={`${pickCss.searchInput} ${css.searchInput}`}
              value={query}
              maxLength={PERSONA_WALL_SEARCH_MAX_LENGTH}
              placeholder={t("admin:personaWall.addDialog.searchPlaceholder")}
              autoComplete="off"
              aria-describedby={
                isFull ? `${searchHintId} ${fullHintId}` : searchHintId
              }
              onChange={(event) => {
                setQuery(event.target.value);
                setErrorKey(null);
              }}
            />
          </div>
          <p id={searchHintId} className={pickCss.fieldHint}>
            {t("admin:personaWall.addDialog.searchHint")}
          </p>
        </div>
        <Collapse isOpen={isFull}>
          <p id={fullHintId} className={pickCss.fieldHint}>
            {t("admin:personaWall.full", PERSONA_WALL_ERROR_VALUES)}
          </p>
        </Collapse>
        <PersonaWallSearchResults
          search={search}
          isFull={isFull}
          isBusy={isBusy}
          onChoose={choose}
        />
        <Collapse isOpen={errorKey !== null}>
          <p className={pickCss.error} role="alert">
            {lastErrorKey ? t(lastErrorKey, PERSONA_WALL_ERROR_VALUES) : null}
          </p>
        </Collapse>
      </div>
    </Modal>
  );
}
