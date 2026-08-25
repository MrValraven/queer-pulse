import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  filtersToCriteria,
  useCreateHousingSavedSearch,
} from "./api/useHousingSavedSearches";
import type { HousingFilters } from "./housingFilters";
import s from "./HousingPage.module.css";

/**
 * "Save this search" — turns the current filter set into a named saved search
 * with alerts on, so the member is notified when a new matching home goes live.
 * Dual-mode via the mutation hook (demo store vs live endpoint).
 */
export function HousingSaveSearch({
  filters,
  disabled,
}: {
  filters: HousingFilters;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createSavedSearch = useCreateHousingSavedSearch();

  // Move focus to the name field when the inline form opens (replaces the
  // flagged `autoFocus` prop while keeping the same keyboard-first flow).
  useEffect(() => {
    if (naming) inputRef.current?.focus();
  }, [naming]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createSavedSearch.mutate(
      {
        name: trimmed,
        criteria: filtersToCriteria(filters),
        alertsEnabled: true,
      },
      {
        onSuccess: () => {
          showToast(t("economy:housing.saveSearch.saved"), "success");
          setNaming(false);
          setName("");
        },
        onError: () =>
          showToast(t("economy:housing.saveSearch.error"), "error"),
      },
    );
  };

  if (!naming) {
    return (
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => setNaming(true)}
      >
        <FiBell aria-hidden /> {t("economy:housing.saveSearch.cta")}
      </Button>
    );
  }

  return (
    <div className={s.saveForm}>
      <input
        ref={inputRef}
        type="text"
        className={s.saveInput}
        value={name}
        maxLength={80}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSave();
          if (event.key === "Escape") setNaming(false);
        }}
        placeholder={t("economy:housing.saveSearch.namePlaceholder")}
        aria-label={t("economy:housing.saveSearch.nameLabel")}
      />
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={!name.trim() || createSavedSearch.isPending}
      >
        {t("economy:housing.saveSearch.save")}
      </Button>
      <Button variant="ghost" onClick={() => setNaming(false)}>
        {t("economy:housing.saveSearch.cancel")}
      </Button>
    </div>
  );
}
