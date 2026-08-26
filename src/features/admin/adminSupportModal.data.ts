import type { CommunitySupportOption } from "../communities/api/communitySupportOffers.api";

/**
 * The admin console's copy for each kind of support, keyed by the same stable
 * option keys the backend validates against
 * (`communities/api/communitySupportOffers.api.ts`, mirrored from
 * `queerpulse-backend/src/communities/community-support-options.ts`).
 *
 * Deliberately separate from `SUPPORT_OPTION_LABEL_KEY` in that file, which
 * holds the MEMBER-facing labels a community's moderators read. These are
 * written to the person choosing what to offer ("Assign a staff buddy for 2
 * weeks"); those are written to the people being offered it.
 *
 * Declaration order is display order in the modal, and it matches the registry
 * so the checklist reads the same way on both sides.
 *
 * `message_moderators` carries no `subKey` that can be used as-is: its sub-line
 * names the community's actual moderators, so `AdminSupportModal` resolves it
 * with their names (or the no-moderators variant) instead.
 */
export const SUPPORT_MODAL_OPTIONS: Record<
  CommunitySupportOption,
  { titleKey: string; subKey: string }
> = {
  message_moderators: {
    titleKey: "admin:communities.support.option.message.title",
    subKey: "admin:communities.support.option.message.subNoMods",
  },
  staff_buddy: {
    titleKey: "admin:communities.support.option.buddy.title",
    subKey: "admin:communities.support.option.buddy.sub",
  },
  deescalation_toolkit: {
    titleKey: "admin:communities.support.option.toolkit.title",
    subKey: "admin:communities.support.option.toolkit.sub",
  },
  recruit_moderator: {
    titleKey: "admin:communities.support.option.recruit.title",
    subKey: "admin:communities.support.option.recruit.sub",
  },
};
