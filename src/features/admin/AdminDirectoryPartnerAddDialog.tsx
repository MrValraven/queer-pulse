import { useId, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DIRECTORY_PARTNER_NOTE_MAX,
  type AdminDirectoryPartnerSearchResultDTO,
} from "../marketing/api/directoryPartners.api";
import {
  DIRECTORY_PARTNER_SEARCH_MAX,
  useDirectoryPartnerCandidateSearch,
} from "./api/useAdminDirectoryPartners";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";
import { AdminDirectoryPartnerSearchResults } from "./AdminDirectoryPartnerSearchResults";
import { AdminDirectoryPartnerChosenCard } from "./AdminDirectoryPartnerChosenCard";
import { StudioAdminNoteField } from "./StudioAdminNoteField";
import type { AddDirectoryPartnerMutation } from "./useAdminDirectoryPartnersActions";
import pickCss from "./StudioAdminPickDialog.module.css";
import css from "./AdminDirectoryPartners.module.css";

/** Add a partner: search live listings by name, choose one, add an
 *  optional one-line note. Choosing folds the results away and the chosen
 *  card takes their place; typing again or "Choose another business" brings
 *  them back. A refusal names its cause under the note. */
export function AdminDirectoryPartnerAddDialog({
  addPartner,
  isBusy,
  onClose,
}: {
  addPartner: AddDirectoryPartnerMutation;
  isBusy: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const searchId = useId();
  const searchHintId = useId();
  const chooseHintId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const search = useDirectoryPartnerCandidateSearch(query);
  const [chosen, setChosen] =
    useState<AdminDirectoryPartnerSearchResultDTO | null>(null);
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  function submit() {
    if (isBusy || !chosen) return;
    addPartner.mutate(
      { listingId: chosen.listingId, note: note.trim() || null },
      {
        onSuccess: () => {
          showToast(
            t("admin:directoryPartners.toast.added", { name: chosen.name }),
            "success",
          );
          onClose();
        },
        onError: (cause) => setErrorKey(directoryPartnerErrorKeyOf(cause)),
      },
    );
  }

  return (
    <Modal
      title={t("admin:directoryPartners.addDialog.title")}
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
            aria-disabled={isBusy || chosen === null || undefined}
            aria-describedby={chosen === null ? chooseHintId : undefined}
            aria-busy={addPartner.isPending || undefined}
            onClick={submit}
          >
            {t("admin:directoryPartners.addDialog.submitCta")}
          </Button>
        </>
      }
    >
      <form
        className={pickCss.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={pickCss.field}>
          <label htmlFor={searchId} className={pickCss.fieldLabel}>
            {t("admin:directoryPartners.addDialog.searchLabel")}
          </label>
          <div className={pickCss.searchShell}>
            <FiSearch className={pickCss.searchIcon} aria-hidden />
            <input
              id={searchId}
              ref={searchRef}
              type="search"
              className={`${pickCss.searchInput} ${css.searchInput}`}
              value={query}
              maxLength={DIRECTORY_PARTNER_SEARCH_MAX}
              placeholder={t(
                "admin:directoryPartners.addDialog.searchPlaceholder",
              )}
              autoComplete="off"
              aria-describedby={searchHintId}
              onChange={(event) => {
                setQuery(event.target.value);
                setChosen(null);
                setErrorKey(null);
              }}
            />
          </div>
          <p id={searchHintId} className={pickCss.fieldHint}>
            {t("admin:directoryPartners.addDialog.searchHint")}
          </p>
          {/* Shown from the start while nothing is chosen, so Add partner
              explains itself and a click never grows the dialog. */}
          <Collapse isOpen={chosen === null}>
            <p id={chooseHintId} className={pickCss.fieldHint}>
              {t("admin:directoryPartners.addDialog.chooseFirst")}
            </p>
          </Collapse>
        </div>
        <Collapse isOpen={chosen === null}>
          <AdminDirectoryPartnerSearchResults
            search={search}
            chosenId={chosen?.listingId ?? null}
            onChoose={(result) => {
              setChosen(result);
              setErrorKey(null);
            }}
          />
        </Collapse>
        <AdminDirectoryPartnerChosenCard
          chosen={chosen}
          onChange={() => {
            setChosen(null);
            setErrorKey(null);
            searchRef.current?.focus();
          }}
        />
        <StudioAdminNoteField
          value={note}
          maxLength={DIRECTORY_PARTNER_NOTE_MAX}
          measureLength={(noteValue) => Array.from(noteValue).length}
          hintKey="admin:directoryPartners.noteHint"
          onChange={(value) => {
            setNote(value);
            setErrorKey(null);
          }}
        />
        <Collapse isOpen={errorKey !== null}>
          <p className={pickCss.error} role="alert">
            {errorKey ? t(errorKey, DIRECTORY_PARTNER_ERROR_VALUES) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
