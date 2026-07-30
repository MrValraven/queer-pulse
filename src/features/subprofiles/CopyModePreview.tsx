import { FormField, SegmentedControl } from "../../shared/components/ui";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { duplicatePreview, type CopyMode } from "./subprofileDuplicate";
import styles from "./MySubprofilesPage.module.css";

/** Choose full-config vs content-only, with a summary of exactly what will be
 *  copied from the selected source (real counts, not placeholders). This
 *  repo's `t()` interpolates `{token}` (single-brace) and has no i18next
 *  `context` support (see `translate.ts`'s `resolveEntry`) — so the summary
 *  is composed from a counts key plus an identity/no-identity tail key,
 *  rather than a single `context`-branched string. */
export function CopyModePreview({
  source,
  mode,
  onChange,
  t,
}: {
  source: SubprofileView;
  mode: CopyMode;
  onChange: (mode: CopyMode) => void;
  t: TranslationApi["t"];
}) {
  const choices: Array<{ value: CopyMode; label: string }> = [
    { value: "full", label: t("subprofiles:copy.modeFull") },
    { value: "content", label: t("subprofiles:copy.modeContent") },
  ];
  const current = choices.find((choice) => choice.value === mode)!;
  const preview = duplicatePreview(source, mode);
  const countsText = t("subprofiles:copy.summaryCounts", {
    items: preview.itemCount,
    links: preview.linkCount,
  });
  const affiliationsText =
    preview.affiliationCount > 0
      ? " · " +
        t("subprofiles:copy.summaryAffiliations", {
          affiliations: preview.affiliationCount,
        })
      : "";
  const identityText = preview.includesIdentity
    ? t("subprofiles:copy.summaryIdentity")
    : t("subprofiles:copy.summaryNoIdentity");
  const summary = countsText + affiliationsText + " " + identityText;

  return (
    <FormField label={t("subprofiles:copy.modeLabel")}>
      <SegmentedControl
        fullWidth
        options={choices.map((choice) => choice.label)}
        value={current.label}
        onChange={(value) => {
          const match = choices.find((choice) => choice.label === value);
          if (match) onChange(match.value);
        }}
      />
      <p className={styles.copySummary}>{summary}</p>
    </FormField>
  );
}
