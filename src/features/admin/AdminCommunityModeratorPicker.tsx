import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminModeratorCandidateDTO } from "./api/adminCommunities.api";
import { useAddModerator } from "./api/useAdminModerators";
import type { Moderator } from "./adminCommunities.data";
import {
  ModeratorCandidateSearchField,
  ModeratorCandidateStatus,
} from "./ModeratorCandidateSearch";
import { useModeratorPickerCandidates } from "./useModeratorPickerCandidates";
import styles from "./AdminCommunitiesPage.module.css";
import pickerStyles from "./AdminCommunityModeratorPicker.module.css";

interface AdminCommunityModeratorPickerProps {
  communitySlug: string;
  /** The current moderators. Demo leaves them out of the fixture roster;
   *  live gets that from the server. */
  moderators: readonly Moderator[];
  onClose: () => void;
  /** The "+ Add" trigger. Focus returns to it on pick or cancel, since both
   *  unmount the button that held focus. */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  /** Demo only: adds the picked member to the local moderator chips. */
  onDemoPromote?: (candidate: AdminModeratorCandidateDTO) => void;
}

/**
 * The add-moderator picker (ENG-492): a name search over the community's
 * promotable members, showing at most 25 at a time. Picking one promotes them
 * (live) or adds them to the local chips (demo), then closes the picker.
 */
export function AdminCommunityModeratorPicker({
  communitySlug,
  moderators,
  onClose,
  returnFocusRef,
  onDemoPromote,
}: AdminCommunityModeratorPickerProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const moderatorNames = useMemo(
    () => moderators.map((moderator) => moderator.name),
    [moderators],
  );
  const {
    candidates,
    settledSearchTerm,
    isLoading,
    isError,
    isRetrying,
    isSearchPending,
    isCapped,
    retry,
  } = useModeratorPickerCandidates(communitySlug, moderatorNames, searchInput);
  const addModerator = useAddModerator(communitySlug);

  // Opening the picker moves focus to its search, the obvious next step.
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  function closePicker() {
    onClose();
    returnFocusRef.current?.focus();
  }

  function showAddedToast(name: string) {
    showToast(
      t("admin:communities.settings.mod.addedToast", { name }),
      "success",
    );
  }

  function onPick(candidate: AdminModeratorCandidateDTO) {
    if (demoMode) {
      onDemoPromote?.(candidate);
      showAddedToast(candidate.name);
      closePicker();
      return;
    }
    addModerator.mutate(
      { memberId: candidate.userId },
      {
        onSuccess: () => {
          showAddedToast(candidate.name);
          closePicker();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.mod.addFailedToast", {
              name: candidate.name,
            }),
            "error",
          ),
      },
    );
  }

  return (
    <div
      className={styles.modPicker}
      role="group"
      aria-label={t("admin:communities.settings.mod.addPickerTitle")}
    >
      <ModeratorCandidateSearchField
        value={searchInput}
        onChange={setSearchInput}
        inputRef={searchInputRef}
      />
      <ModeratorCandidateStatus
        isLoading={isLoading}
        isError={isError}
        isRetrying={isRetrying}
        isEmpty={candidates?.length === 0 && !isSearchPending}
        isCapped={isCapped}
        settledSearchTerm={settledSearchTerm}
        emptyMessage={t("admin:communities.settings.mod.pickerEmpty")}
        onRetry={retry}
      />
      {!isError && candidates && candidates.length > 0 && (
        <ul className={pickerStyles.candidateList} aria-busy={isSearchPending}>
          {candidates.map((candidate) => (
            <li key={candidate.userId}>
              <button
                type="button"
                className={styles.modPickerItem}
                disabled={addModerator.isPending}
                onClick={() => onPick(candidate)}
              >
                {candidate.name}{" "}
                <span className={pickerStyles.candidateHandle}>
                  @{candidate.slug}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={styles.addBtn} onClick={closePicker}>
        {t("admin:communities.settings.mod.cancelCta")}
      </button>
    </div>
  );
}
