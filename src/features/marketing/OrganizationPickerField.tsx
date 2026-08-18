import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useOrganizationOptions } from "./api/useOrganizationOptions";

export interface OrganizationLink {
  partnerSlug: string;
  communitySlug: string;
}

const NONE = "";

function encode(kind: "partner" | "community", slug: string): string {
  return `${kind}:${slug}`;
}

/**
 * The single combined "organization" control a volunteering opportunity's
 * create/edit form offers: one `Select` grouping approved partner orgs and
 * the communities the poster owns or moderates, so picking one sets the
 * right one of `partnerSlug`/`communitySlug` and clears the other (an
 * opportunity links to at most one organization). `onChange`'s second
 * argument carries the selected option's display name, so a required caller
 * (the create form) can mirror it into its own free-text `org` field without
 * re-deriving it from the slug.
 *
 * `required` (the create form's "Organisation" field) drops the "None"
 * choice and, when there's nothing to pick from, swaps the control for an
 * explanatory empty state instead of rendering nothing. The default
 * (optional — the edit form's "link" field) renders null when the viewer has
 * neither a partner nor a community to offer, mirroring `EditDetailsModal`'s
 * `myCommunityOptions.length > 0` guard.
 */
export function OrganizationPickerField({
  value,
  onChange,
  required = false,
  error,
}: {
  value: OrganizationLink;
  onChange: (next: OrganizationLink, meta: { name: string }) => void;
  required?: boolean;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const options = useOrganizationOptions();

  if (!options.length) {
    if (!required) return null;
    return (
      <FormField label={t("marketing:postOpportunity.core.orgLabel")} required>
        {t("marketing:postOpportunity.core.orgEmptyState")}
      </FormField>
    );
  }

  const selected = value.partnerSlug
    ? encode("partner", value.partnerSlug)
    : value.communitySlug
      ? encode("community", value.communitySlug)
      : NONE;

  const selectOptions = [
    ...(required
      ? []
      : [{ value: NONE, label: t("marketing:postOpportunity.core.orgLinkNone") }]),
    ...options.map((option) => ({
      value: encode(option.kind, option.slug),
      label: option.name,
      group:
        option.kind === "partner"
          ? t("marketing:postOpportunity.core.orgLinkGroupPartner")
          : t("marketing:postOpportunity.core.orgLinkGroupCommunity"),
    })),
  ];

  const handleChange = (next: string | null) => {
    const raw = next || NONE;
    if (raw === NONE) {
      onChange({ partnerSlug: "", communitySlug: "" }, { name: "" });
      return;
    }
    const separatorIndex = raw.indexOf(":");
    const kind = raw.slice(0, separatorIndex);
    const slug = raw.slice(separatorIndex + 1);
    const name =
      options.find((option) => option.kind === kind && option.slug === slug)
        ?.name ?? "";
    onChange(
      kind === "partner"
        ? { partnerSlug: slug, communitySlug: "" }
        : { partnerSlug: "", communitySlug: slug },
      { name },
    );
  };

  return (
    <FormField
      label={t(
        required
          ? "marketing:postOpportunity.core.orgLabel"
          : "marketing:postOpportunity.core.orgLinkLabel",
      )}
      required={required}
      helper={t(
        required
          ? "marketing:postOpportunity.core.orgHelper"
          : "marketing:postOpportunity.core.orgLinkHelper",
      )}
      error={error}
    >
      <Select options={selectOptions} value={selected} onChange={handleChange} />
    </FormField>
  );
}
