import { useEffect, useState } from "react";
import {
  Avatar,
  SearchInput,
  Button,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName, leadingInitials } from "../../shared/lib/initials";
import { AdminLandingCopyFields } from "./AdminLandingCopyFields";
import {
  buildLandingCopy,
  emptyLandingCopyValue,
  isLandingCopyValid,
  type LandingCopyFieldsValue,
} from "./adminLandingCopyFields.utils";
import {
  useLandingEligible,
  useCreateLandingFeature,
} from "./api/useLandingFeatures";
import type {
  AdminEligibleEntityDTO,
  LandingSection,
} from "./api/landingFeatures.api";
import styles from "./AdminLandingPage.module.css";

/**
 * Search-and-add half of the landing curator. Debounces the query into
 * `useLandingEligible`, lists everyone not yet featured in `section`, and
 * lets the admin add one.
 *
 * Clicking "Add" does NOT POST immediately — it expands an inline copy form
 * (the shared `AdminLandingCopyFields`, same fields as the row editor) under
 * that entity. The backend's `validateLandingCopy` rejects an empty member
 * `quote` or changemaker `cause`/`blurb` with a 400, so the required copy is
 * collected and validated client-side (`isLandingCopyValid`) BEFORE
 * `useCreateLandingFeature` ever fires — no create request is attempted with
 * copy the server would reject. Community's `blurb` is optional, so its
 * submit button is never disabled by content.
 */
export function AdminLandingEligiblePicker({
  section,
}: {
  section: LandingSection;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    );
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { options, isLoading } = useLandingEligible(section, debouncedSearch);
  const createFeature = useCreateLandingFeature();
  const [composingId, setComposingId] = useState<string | null>(null);
  const [composingValue, setComposingValue] = useState<LandingCopyFieldsValue>(
    emptyLandingCopyValue(),
  );

  function startComposing(targetId: string) {
    setComposingId(targetId);
    setComposingValue(emptyLandingCopyValue());
  }

  function handleSubmit(option: AdminEligibleEntityDTO) {
    createFeature.mutate(
      {
        section,
        targetId: option.targetId,
        copy: buildLandingCopy(section, composingValue),
      },
      {
        onSuccess: () => {
          showToast(t("admin:landing.picker.addedToast"));
          setComposingId(null);
        },
        onError: () => showToast(t("admin:landing.picker.addError")),
      },
    );
  }

  return (
    <div className={styles.picker}>
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder={t("admin:landing.picker.searchPlaceholder")}
        ariaLabel={t("admin:landing.picker.searchAriaLabel")}
      />
      <p className={styles.pickerHelper}>
        {t(`admin:landing.helper.${section}`)}
      </p>

      {isLoading ? (
        <div className={styles.pickerSkeletons}>
          <SkeletonLine height={40} style={{ borderRadius: 12 }} />
          <SkeletonLine height={40} style={{ borderRadius: 12 }} />
        </div>
      ) : options.length === 0 ? (
        <p className={styles.pickerEmpty}>
          {debouncedSearch
            ? t("admin:landing.picker.noResults", { search: debouncedSearch })
            : t(`admin:landing.picker.empty.${section}`)}
        </p>
      ) : (
        <ul className={styles.pickerList}>
          {options.map((option) => (
            <AdminLandingEligibleRow
              key={option.targetId}
              section={section}
              option={option}
              composing={composingId === option.targetId}
              composingValue={composingValue}
              onStartComposing={() => startComposing(option.targetId)}
              onCancelComposing={() => setComposingId(null)}
              onComposingChange={(patch) =>
                setComposingValue((current) => ({ ...current, ...patch }))
              }
              onSubmit={() => handleSubmit(option)}
              submitting={createFeature.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminLandingEligibleRow({
  section,
  option,
  composing,
  composingValue,
  onStartComposing,
  onCancelComposing,
  onComposingChange,
  onSubmit,
  submitting,
}: {
  section: LandingSection;
  option: AdminEligibleEntityDTO;
  composing: boolean;
  composingValue: LandingCopyFieldsValue;
  onStartComposing: () => void;
  onCancelComposing: () => void;
  onComposingChange: (patch: Partial<LandingCopyFieldsValue>) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  const canSubmit = isLandingCopyValid(section, composingValue);

  return (
    <li className={styles.pickerRow}>
      <div className={styles.pickerRowHead}>
        <Avatar
          initials={
            section === "community"
              ? leadingInitials(option.name)
              : initialsFromName(option.name)
          }
          src={option.avatarUrl ?? undefined}
          name={option.name}
          size={36}
        />
        <span className={styles.pickerName}>{option.name}</span>
        <Button
          variant="ghost"
          size="md"
          onClick={composing ? onCancelComposing : onStartComposing}
        >
          {t(composing ? "admin:common.cancel" : "admin:landing.picker.addCta")}
        </Button>
      </div>

      {composing && (
        <div className={styles.pickerCompose}>
          <AdminLandingCopyFields
            section={section}
            value={composingValue}
            onChange={onComposingChange}
          />
          <div className={styles.editorActions}>
            <Button
              variant="primary"
              size="md"
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
            >
              {t("admin:landing.picker.submitCta")}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
