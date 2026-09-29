import { useId, useRef } from "react";
import { FiEdit3, FiLink } from "react-icons/fi";
import {
  FormField,
  SegmentedControl,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useOrganizationOptions,
  type OrganizationOption,
  type OrganizationPickerOption,
} from "./api/useOrganizationOptions";
import type { OrganizationMode } from "./postOpportunityState";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import {
  MAX_ORGANIZATION_LENGTH,
  requiredFieldControlId,
} from "./postVolunteerOpportunity.data";
import styles from "./OrganizationField.module.css";

/** One `Select` value per option; kind + slug, since a partner and a
 *  community may share a slug. */
const optionValue = (option: Pick<OrganizationOption, "kind" | "slug">) =>
  `${option.kind}:${option.slug}`;

/** The state change that links `option`: its slug in the matching field, the
 *  other one cleared (an opportunity links to at most one organisation), and
 *  its name mirrored into `org`, which the backend requires and the post
 *  shows as the organisation's display name. */
const linkTo = (option: OrganizationOption) => ({
  orgMode: "link" as const,
  partnerSlug: option.kind === "partner" ? option.slug : "",
  communitySlug: option.kind === "community" ? option.slug : "",
  org: option.name,
});

/**
 * The volunteering form's single "Organisation" field. The poster either
 * types the name, or links one organisation they run (a partner they
 * maintain, or a community they own or moderate), and only the control for
 * the chosen mode renders. Linking sets exactly one of `partnerSlug`/
 * `communitySlug` and fills `org` with the organisation's name, so `org`
 * stays the one required field the validation and the "still missing"
 * checklist read in either mode; both controls carry its control id.
 *
 * The mode choice only appears when there is something to link (or the form
 * already holds a link). A poster who runs nothing sees the plain text input.
 * Both cases render the same tree, so options arriving mid-typing only add
 * the mode row above the input and leave the input (focus, caret) in place.
 */
export function OrganizationField({ form }: { form: PostOpportunityForm }) {
  const { t } = useTranslation();
  const { state, set, patch, errorFor } = form;
  const options = useOrganizationOptions(form.pinnedOrganizations);
  const labelId = useId();
  const requiredNoteId = useId();
  const controlId = requiredFieldControlId("org");
  // What each mode held when the poster left it, so switching back restores
  // it. `null` means the poster has not left that mode yet.
  const lastTypedNameRef = useRef<string | null>(null);
  const lastLinkValueRef = useRef<string | null>(null);
  const isLinkMode = state.orgMode === "link";
  const isChoiceShown = isLinkMode || options.length > 0;
  const label = t("marketing:postOpportunity.core.orgLabel");
  const counter = `${state.org.length}/${MAX_ORGANIZATION_LENGTH}`;
  const selectedValue = state.partnerSlug
    ? optionValue({ kind: "partner", slug: state.partnerSlug })
    : state.communitySlug
      ? optionValue({ kind: "community", slug: state.communitySlug })
      : null;
  const groupLabelFor = (option: OrganizationPickerOption) =>
    option.isPinnedOnly
      ? t("marketing:postOpportunity.core.orgLinkGroupCurrent")
      : option.kind === "partner"
        ? t("marketing:postOpportunity.core.orgLinkGroupPartner")
        : t("marketing:postOpportunity.core.orgLinkGroupCommunity");

  const selectMode = (mode: OrganizationMode) => {
    if (mode === state.orgMode) return;
    if (mode === "text") {
      lastLinkValueRef.current = selectedValue;
      const linkedName = options.find(
        (option) => optionValue(option) === selectedValue,
      )?.name;
      const typedName = lastTypedNameRef.current;
      // A name the poster edited after linking stays; otherwise the typed
      // name comes back, or the linked name stays as a starting point.
      const shouldRestoreTypedName =
        typedName !== null && state.org === linkedName;
      patch({
        orgMode: "text",
        partnerSlug: "",
        communitySlug: "",
        ...(shouldRestoreTypedName ? { org: typedName } : {}),
      });
      return;
    }
    lastTypedNameRef.current = state.org;
    const lastLink =
      options.find(
        (option) => optionValue(option) === lastLinkValueRef.current,
      ) ?? options[0];
    patch(lastLink ? linkTo(lastLink) : { orgMode: "link" });
  };

  return (
    <div className={styles.field}>
      {/* Shown, this row carries the field's visible label, and the control
          below takes its name from that label's id. */}
      {isChoiceShown && (
        <FormField
          className={styles.modeRow}
          label={<span id={labelId}>{label}</span>}
          required
          labelAside={isLinkMode ? undefined : counter}
        >
          <OrganizationModeChoice mode={state.orgMode} onChange={selectMode} />
        </FormField>
      )}
      <FormField
        label={isChoiceShown ? undefined : label}
        required
        error={errorFor("org")}
        labelAside={isChoiceShown ? undefined : counter}
        helper={
          isLinkMode
            ? t("marketing:postOpportunity.core.orgLinkHelper")
            : undefined
        }
      >
        {isLinkMode ? (
          // Named "Organisation, <picked organisation>": the label, then the
          // trigger's own text. `aria-required` is invalid on its button
          // role, so the hidden note below carries "required" as part of the
          // description, ahead of FormField's helper and error ids.
          <Select
            id={controlId}
            labelledBy={`${labelId} ${controlId}`}
            aria-describedby={requiredNoteId}
            value={selectedValue}
            options={options.map((option) => ({
              value: optionValue(option),
              label: option.name,
              group: groupLabelFor(option),
            }))}
            onChange={(picked) => {
              const option = options.find(
                (each) => optionValue(each) === picked,
              );
              if (option) patch(linkTo(option));
            }}
          />
        ) : (
          <input
            id={controlId}
            type="text"
            value={state.org}
            onChange={(event) => set("org", event.target.value)}
            maxLength={MAX_ORGANIZATION_LENGTH}
            placeholder={t("marketing:postOpportunity.core.orgPlaceholder")}
            aria-labelledby={isChoiceShown ? labelId : undefined}
          />
        )}
      </FormField>
      {isLinkMode && (
        <span id={requiredNoteId} className="visuallyHidden">
          {t("marketing:postOpportunity.core.orgRequiredNote")}
        </span>
      )}
    </div>
  );
}

/** "Type a name" / "Link one I run", as a compact two-segment switch. */
function OrganizationModeChoice({
  mode,
  onChange,
}: {
  mode: OrganizationMode;
  onChange: (mode: OrganizationMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      label={t("marketing:postOpportunity.core.orgModeLabel")}
      value={mode}
      onChange={(value) => onChange(value === "link" ? "link" : "text")}
      options={[
        {
          value: "text",
          label: t("marketing:postOpportunity.core.orgModeText"),
          icon: <FiEdit3 />,
        },
        {
          value: "link",
          label: t("marketing:postOpportunity.core.orgModeLink"),
          icon: <FiLink />,
        },
      ]}
    />
  );
}
