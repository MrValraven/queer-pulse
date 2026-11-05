import { useId, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import pickCss from "../StudioAdminPickDialog.module.css";
import {
  LEAD_SEARCH_QUERY_MAX,
  type LeadPersonaDTO,
  type LeadPersonaSearch,
} from "./api/leads.types";
import type { LeadFieldError } from "./leadForm.model";
import { LeadPersonaSearchResults } from "./LeadPersonaSearchResults";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadPersona.module.css";

/**
 * Link persona: search the public directory by name or @handle, then press a
 * result to link it to this lead. The caller owns the query, the search and
 * the write; a refusal shows under the results and names its cause, with
 * "Open <name>" when it names another lead and `openLeadPath` is given.
 */
export function LeadPersonaDialog({
  query,
  onQueryChange,
  search,
  currentLeadId,
  isBusy,
  error,
  onChoose,
  onClose,
  openLeadPath,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  search: LeadPersonaSearch;
  currentLeadId: string;
  isBusy: boolean;
  error: LeadFieldError | null;
  onChoose: (persona: LeadPersonaDTO) => void;
  onClose: () => void;
  /** The lead page path, for the "Open <name>" link a taken persona's
   *  refusal carries. Without it the refusal shows its line alone. */
  openLeadPath?: (leadId: string) => string;
}) {
  const { t } = useTranslation();
  const searchId = useId();
  const searchHintId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      title={t("admin:leads.personaDialog.title")}
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
            {t("admin:leads.personaDialog.searchLabel")}
          </label>
          <div className={pickCss.searchShell}>
            <FiSearch className={pickCss.searchIcon} aria-hidden />
            <input
              id={searchId}
              ref={searchRef}
              type="search"
              className={`${pickCss.searchInput} ${styles.searchInput}`}
              value={query}
              maxLength={LEAD_SEARCH_QUERY_MAX}
              placeholder={t("admin:leads.personaDialog.searchPlaceholder")}
              autoComplete="off"
              aria-describedby={searchHintId}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
          <p
            id={searchHintId}
            className={`${pickCss.fieldHint} ${pickCss.searchHint}`}
          >
            {t("admin:leads.personaDialog.searchHint")}
          </p>
        </div>
        <LeadPersonaSearchResults
          search={search}
          currentLeadId={currentLeadId}
          isBusy={isBusy}
          onChoose={onChoose}
        />
        <LeadRefusalLine error={error} openLeadPath={openLeadPath} />
      </div>
    </Modal>
  );
}
