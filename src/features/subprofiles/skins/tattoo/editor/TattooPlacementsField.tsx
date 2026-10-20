import { useState } from "react";
import { FormField } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { parsePlacements } from "./tattooItemDraft";

/**
 * The comma-separated placements input. It holds the text as typed, like the
 * tags field, so a typed comma stays in the box while the stored list is the
 * cleaned `parsePlacements` result.
 */
export function TattooPlacementsField({
  placements,
  onChange,
}: {
  placements: string[];
  onChange: (placements: string[]) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(() => placements.join(", "));
  return (
    <FormField
      label={t("subprofiles:tattooItem.placements.label")}
      helper={t("subprofiles:tattooItem.placements.helper")}
    >
      <input
        value={text}
        placeholder={t("subprofiles:tattooItem.placements.placeholder")}
        onChange={(event) => {
          setText(event.target.value);
          onChange(parsePlacements(event.target.value));
        }}
      />
    </FormField>
  );
}
