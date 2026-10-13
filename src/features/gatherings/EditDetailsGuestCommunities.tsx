import { useId } from "react";
import { FiSearch } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import { TextInput } from "./CreateGatheringFields";
import { GuestCommunitiesPicker } from "./GuestCommunitiesPicker";
import type { GuestListStatus } from "./savedGuestListContext";
import pickerStyles from "./GuestCommunitiesPicker.module.css";

/**
 * "Guest communities" in the edit modal's "Who it's for" section. The
 * picker sits inside the modal's own `FormField`, so it reads like the
 * fields around it; the label cannot point at a nested input, so the input
 * carries the same words as its accessible name. Changes stay in the draft
 * until Save, which is what lets "Undo section changes" put them back.
 *
 * Until the saved list has answered, the field shows its search locked (and
 * busy while it loads). A failed list says so with a retry, the same block
 * the picker's own search shows, so the host can edit everything else
 * meanwhile and never changes a list they cannot see.
 */
export function EditDetailsGuestCommunities({
  leadSlug,
  guests,
  status,
  onRetry,
  onChange,
}: {
  leadSlug: string;
  guests: GuestCommunityDraftEntry[];
  status: GuestListStatus;
  onRetry: () => void;
  onChange: (guests: GuestCommunityDraftEntry[]) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputId = `${fieldId}-guest-communities`;
  const helperId = `${inputId}-helper`;
  const label = t("gatherings:guestCommunities.label");
  const helperKey =
    leadSlug !== ""
      ? "gatherings:guestCommunities.hint"
      : guests.length > 0
        ? "gatherings:guestCommunities.lockedHintWithRows"
        : "gatherings:guestCommunities.lockedHint";
  const lockedSearch = (
    <TextInput
      id={inputId}
      type="search"
      icon={FiSearch}
      disabled
      aria-busy={status === "loading" || undefined}
      aria-label={label}
      aria-describedby={helperId}
      placeholder={t(
        status === "loading"
          ? "gatherings:guestCommunities.loading"
          : "gatherings:guestCommunities.searchPlaceholder",
      )}
    />
  );
  return (
    <FormField
      label={t("gatherings:guestCommunities.labelOptional")}
      helper={status === "ready" ? undefined : t(helperKey)}
      helperId={helperId}
    >
      {status === "ready" ? (
        <GuestCommunitiesPicker
          inputId={inputId}
          describedById={helperId}
          ariaLabel={label}
          helper={t(helperKey)}
          leadSlug={leadSlug}
          guests={guests}
          unsentLabel={t("gatherings:guestCommunities.status.unsentEdit")}
          onChange={onChange}
        />
      ) : status === "failed" ? (
        <div className={pickerStyles.picker}>
          {lockedSearch}
          <div className={pickerStyles.error}>
            <p role="status" className={pickerStyles.errorText}>
              {t("gatherings:guestCommunities.loadError")}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
              {t("shared:loadError.retryCta")}
            </Button>
          </div>
        </div>
      ) : (
        lockedSearch
      )}
    </FormField>
  );
}
