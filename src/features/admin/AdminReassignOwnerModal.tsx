import { useMemo, useState } from "react";
import { ConfirmDialog, EmptyState, Eyebrow } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { foldForSearch } from "../connect/connectionsFilter";
import { useReassignAdminCommunityOwner } from "./api/useAdminCommunityActions";
import type { Community } from "./adminCommunities.data";
import {
  ModeratorCandidateSearchField,
  ModeratorCandidateStatus,
} from "./ModeratorCandidateSearch";
import { useModeratorPickerCandidates } from "./useModeratorPickerCandidates";
import styles from "./AdminCommunitiesPage.module.css";
import pickerStyles from "./AdminCommunityModeratorPicker.module.css";

/** One roster member the reassign-owner picker can target: a current
 *  moderator (minus the owner) or a promotable plain member. The plain
 *  members come from the same capped, searchable candidates query as the
 *  add-moderator picker (ENG-492), so anyone past the first 25 is one search
 *  away. */
interface OwnerCandidate {
  slug: string;
  name: string;
  isModerator: boolean;
}

/** Picks a roster member to hand ownership to, then reassigns it. Mirrors
 *  `ModPanelDangerModals.tsx`'s `TransferOwnershipModal` shape (a radiogroup
 *  inside a `ConfirmDialog`), rebuilt on this admin-only mutation, which
 *  works even when the community currently has no owner at all. */
export function AdminReassignOwnerModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<OwnerCandidate | null>(
    null,
  );
  const moderatorNames = useMemo(
    () => community.moderators.map((moderator) => moderator.name),
    [community.moderators],
  );
  const picker = useModeratorPickerCandidates(
    community.slug,
    moderatorNames,
    searchInput,
  );
  const reassignOwner = useReassignAdminCommunityOwner();

  // The moderators are already on the client and few, so the same folded
  // search narrows them here; the plain members arrive narrowed by the server.
  const foldedSearchTerm = foldForSearch(picker.settledSearchTerm);
  const matchingOptions: OwnerCandidate[] = [
    ...community.moderators
      .filter(
        (moderator) =>
          !moderator.isOwner &&
          moderator.slug &&
          (!foldedSearchTerm ||
            foldForSearch(`${moderator.name} ${moderator.slug}`).includes(
              foldedSearchTerm,
            )),
      )
      .map((moderator) => ({
        slug: moderator.slug!,
        name: moderator.name,
        isModerator: true,
      })),
    ...(picker.candidates ?? []).map((candidate) => ({
      slug: candidate.slug,
      name: candidate.name,
      isModerator: false,
    })),
  ];
  // A choice made before the search changed stays visible and selected.
  const options =
    selectedOption &&
    !matchingOptions.some((option) => option.slug === selectedOption.slug)
      ? [selectedOption, ...matchingOptions]
      : matchingOptions;
  const hasSettledAnswer =
    picker.candidates !== undefined && !picker.isSearchPending;
  const isRosterEmpty =
    hasSettledAnswer && !picker.settledSearchTerm && options.length === 0;

  const confirm = () => {
    if (!selectedOption || reassignOwner.isPending) return;
    reassignOwner.mutate(
      { slug: community.slug, memberSlug: selectedOption.slug },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.overrides.reassignToast", {
              name: selectedOption.name,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.overrides.reassignFailedToast"),
            "error",
          ),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={confirm}
      title={t("admin:communities.settings.overrides.reassignTitle", {
        name: community.name,
      })}
      description={t("admin:communities.settings.overrides.reassignBody")}
      tone="destructive"
      loading={reassignOwner.isPending}
      confirmLabel={t(
        "admin:communities.settings.overrides.reassignConfirmCta",
      )}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      <div className={pickerStyles.ownerSearch}>
        <ModeratorCandidateSearchField
          value={searchInput}
          onChange={setSearchInput}
        />
        <ModeratorCandidateStatus
          isLoading={picker.isLoading}
          isError={picker.isError}
          isRetrying={picker.isRetrying}
          isEmpty={hasSettledAnswer && matchingOptions.length === 0}
          isCapped={picker.isCapped}
          settledSearchTerm={picker.settledSearchTerm}
          onRetry={picker.retry}
        />
      </div>
      {isRosterEmpty ? (
        <EmptyState
          compact
          title={t("admin:communities.settings.overrides.reassignEmptyTitle")}
          description={t(
            "admin:communities.settings.overrides.reassignEmptyDesc",
          )}
        />
      ) : (
        options.length > 0 && (
          <div
            role="radiogroup"
            aria-label={t(
              "admin:communities.settings.overrides.reassignPickLabel",
            )}
            aria-busy={picker.isSearchPending}
            className={styles.ownerPickList}
          >
            {options.map((option) => (
              <label className={styles.ownerPickRow} key={option.slug}>
                <input
                  type="radio"
                  name="admin-reassign-owner"
                  value={option.slug}
                  checked={selectedOption?.slug === option.slug}
                  onChange={() => setSelectedOption(option)}
                />
                <div className={styles.ownerPickMain}>
                  <div className={styles.ownerPickName}>{option.name}</div>
                  {/* The handle tells same-named members apart before an
                      irreversible pick. */}
                  <div className={styles.ownerPickMeta}>
                    @{option.slug}
                    {option.isModerator &&
                      ` · ${t("admin:communities.members.moderatorChip")}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )
      )}
    </ConfirmDialog>
  );
}
