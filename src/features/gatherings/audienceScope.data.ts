import type { EventVisibility } from "./api/events.api";

/**
 * The five audience-scope tiers the create-gathering wizard and the edit
 * modal both offer, widest → narrowest. `id` is the exact wire value
 * (`EventVisibility`) — see docs/superpowers/specs/2026-08-13-gathering-audience-scope-design.md.
 * `public` (anonymous/logged-out) isn't included: the wizard never sets it.
 *
 * i18n Pattern A (see createGathering.data.ts): this file holds catalog keys,
 * not resolved copy — `AudienceScopeField` resolves them via `useTranslation()`.
 */
export interface AudienceScopeOption {
  id: EventVisibility;
  labelKey: string;
  helperKey: string;
}

export const AUDIENCE_SCOPE_OPTIONS: AudienceScopeOption[] = [
  {
    id: "members",
    labelKey: "gatherings:audienceScope.members.label",
    helperKey: "gatherings:audienceScope.members.helper",
  },
  {
    id: "extended_network",
    labelKey: "gatherings:audienceScope.extendedNetwork.label",
    helperKey: "gatherings:audienceScope.extendedNetwork.helper",
  },
  {
    id: "network",
    labelKey: "gatherings:audienceScope.network.label",
    helperKey: "gatherings:audienceScope.network.helper",
  },
  {
    id: "community",
    labelKey: "gatherings:audienceScope.community.label",
    helperKey: "gatherings:audienceScope.community.helper",
  },
  {
    id: "invite_only",
    labelKey: "gatherings:audienceScope.inviteOnly.label",
    helperKey: "gatherings:audienceScope.inviteOnly.helper",
  },
];

/** Resolve an option's label catalog key, falling back to "members" (Public)
 *  for any wire value the wizard doesn't offer (e.g. the backend-only
 *  anonymous `"public"`), so a review row or summary never renders blank. */
export function audienceScopeLabelKey(scope: EventVisibility): string {
  return (
    AUDIENCE_SCOPE_OPTIONS.find((option) => option.id === scope)?.labelKey ??
    AUDIENCE_SCOPE_OPTIONS[0]!.labelKey
  );
}
