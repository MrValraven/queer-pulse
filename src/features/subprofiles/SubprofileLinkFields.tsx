import { FormField, SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import {
  LINK_HELP_KEY,
  LINK_OPTIONS,
  LINK_TO_LABEL_KEY,
  VISIBILITY_OPTIONS,
} from "./subprofileEditor.data";
import { UsernameField } from "../settings/UsernameField";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";
import styles from "./SubprofileEditor.module.css";

interface SubprofileLinkFieldsProps {
  link: LinkVisibility;
  onLinkChange: (value: LinkVisibility) => void;
  ownerSlug: string;
  slug: string;
  onSlugChange: (value: string) => void;
  handle: string;
  onHandleChange: (value: string) => void;
  currentHandle?: string;
  onHandleStatusChange: (status: HandleAvailability) => void;
  visibility: Visibility;
  onVisibilityChange: (value: Visibility) => void;
}

/**
 * How this persona is found: linked to the main profile (with a per-owner
 * address) vs. standing on its own (with a global handle), plus who can see
 * it. Extracted from `SubprofileMetaForm` to keep both components under the
 * 200-line cap. Purely controlled — the parent owns state and the PATCH.
 */
export function SubprofileLinkFields({
  link,
  onLinkChange,
  ownerSlug,
  slug,
  onSlugChange,
  handle,
  onHandleChange,
  currentHandle,
  onHandleStatusChange,
  visibility,
  onVisibilityChange,
}: SubprofileLinkFieldsProps) {
  const { t } = useTranslation();

  const linkChoices = LINK_OPTIONS.map((value) => ({
    value,
    label: t(LINK_TO_LABEL_KEY[value]),
  }));

  return (
    <>
      <FormField label={t("subprofiles:metaForm.linkLabel")}>
        <SegmentedControl
          fullWidth
          options={linkChoices.map((choice) => choice.label)}
          value={t(LINK_TO_LABEL_KEY[link])}
          onChange={(value) => {
            const match = linkChoices.find((choice) => choice.label === value);
            if (match) onLinkChange(match.value);
          }}
        />
      </FormField>
      <p className={styles.linkHelp}>{t(LINK_HELP_KEY[link])}</p>

      {link === "linked" ? (
        <FormField
          label={t("subprofiles:metaForm.addressLabel")}
          helper={
            <>
              {t("subprofiles:metaForm.livesAt")}{" "}
              <span className={styles.pathPreview}>
                /members/{ownerSlug}/{slug || "…"}
              </span>
            </>
          }
        >
          <input
            value={slug}
            placeholder={t("subprofiles:metaForm.addressPlaceholder")}
            onChange={(event) => onSlugChange(event.target.value)}
          />
        </FormField>
      ) : (
        <UsernameField
          value={handle}
          onChange={onHandleChange}
          currentName={currentHandle}
          label={t("subprofiles:metaForm.handleLabel")}
          hint={
            <>
              {t("subprofiles:metaForm.livesAt")}{" "}
              <span className={styles.pathPreview}>/p/{handle || "…"}</span>
            </>
          }
          onStatusChange={onHandleStatusChange}
        />
      )}

      <FormField
        label={t("subprofiles:metaForm.visibilityLabel")}
        helper={t(
          VISIBILITY_OPTIONS.find((option) => option.value === visibility)
            ?.helpKey ?? VISIBILITY_OPTIONS[0]!.helpKey,
        )}
      >
        <select
          value={visibility}
          onChange={(event) =>
            onVisibilityChange(event.target.value as Visibility)
          }
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
