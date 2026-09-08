import { useState } from "react";
import { FiList } from "react-icons/fi";
import { Select, type SelectOption } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileEdit } from "../../app/providers/useProfile";
import {
  LISBON_NEIGHBOURHOODS,
  isLisbonNeighbourhood,
  type LisbonNeighbourhoodKind,
} from "../../shared/geo/lisbonNeighbourhoods";
import { InlineText } from "./profileEditControls";
import styles from "./ProfileEdit.module.css";

/** Sentinel value for the trailing "somewhere else" row. Double-underscored so
 *  it can never collide with a real place name, and never stored: choosing it
 *  swaps the control for a text input and clears the draft. */
const OTHER_OPTION = "__other__";

/** Catalog key per vocabulary. Spelled out rather than interpolated so a
 *  code-to-catalog scan can see both keys are in use. */
const GROUP_LABEL_KEY: Record<LisbonNeighbourhoodKind, string> = {
  bairro: "members:profileEdit.field.neighbourhoodGroup.bairro",
  freguesia: "members:profileEdit.field.neighbourhoodGroup.freguesia",
};

/**
 * The profile's neighbourhood: a select over the shared Lisbon vocabulary
 * (`shared/geo/lisbonNeighbourhoods`), with a free-text escape hatch.
 *
 * It was a plain text input, so every member spelled their area their own way
 * and the directory's "Where they're based" filter, which matches the stored
 * text against a fixed list server-side, quietly failed to find most of them.
 * Picking from the list is what makes a member findable. Typing stays
 * available too: the platform is Lisbon-first, and someone in Porto should
 * still get to say where they live.
 *
 * The control opens in text mode when the saved value is outside the pickable
 * areas, so an existing answer survives the change.
 */
export function ProfileNeighbourhoodField() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  const [wantsCustom, setWantsCustom] = useState(false);
  // Recomputed every render. The draft starts empty and fills in when the
  // profile request lands, so a mount-time snapshot would leave a member whose
  // saved area is off-list staring at an empty select while their real answer
  // sat in the draft.
  const hasOffListValue =
    draft.hood.trim() !== "" && !isLisbonNeighbourhood(draft.hood);
  const isCustom = wantsCustom || hasOffListValue;

  const label = t("members:profileEdit.field.neighbourhood");

  const options: SelectOption[] = [
    ...LISBON_NEIGHBOURHOODS.map((entry) => ({
      value: entry.name,
      label: entry.name,
      group: t(GROUP_LABEL_KEY[entry.kind]),
    })),
    {
      value: OTHER_OPTION,
      label: t("members:profileEdit.field.neighbourhoodOther"),
      group: t("members:profileEdit.field.neighbourhoodGroup.other"),
    },
  ];

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {isCustom ? (
        <>
          <InlineText
            value={draft.hood}
            ariaLabel={label}
            placeholder={t(
              "members:profileEdit.field.neighbourhoodOtherPlaceholder",
            )}
            className={styles.hoodInput}
            onChange={(value) => updateDraft({ hood: value })}
          />
          <button
            type="button"
            className={styles.hoodBackToList}
            onClick={() => {
              setWantsCustom(false);
              updateDraft({ hood: "" });
            }}
          >
            <FiList aria-hidden />
            {t("members:profileEdit.field.neighbourhoodBackToList")}
          </button>
        </>
      ) : (
        <Select
          className={styles.hoodSelect}
          options={options}
          label={label}
          placeholder={t("members:profileEdit.field.neighbourhoodPlaceholder")}
          searchPlaceholder={t(
            "members:profileEdit.field.neighbourhoodSearchPlaceholder",
          )}
          clearable
          value={draft.hood || null}
          onChange={(value) => {
            if (value === OTHER_OPTION) {
              setWantsCustom(true);
              updateDraft({ hood: "" });
              return;
            }
            updateDraft({ hood: value ?? "" });
          }}
        />
      )}
    </div>
  );
}
