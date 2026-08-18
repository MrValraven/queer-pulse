/** One pickable role/commitment option. The id is validated backend-side
 *  against the same fixed set (`cohost-invite-options.ts` in
 *  queerpulse-backend); the label/description keys live here since display
 *  copy is frontend-owned. */
export interface CohostInviteOption {
  id: string;
  labelKey: string;
  descriptionKey: string;
}

/** What the co-host would actually help with. A host picks one when sending
 *  an invite (`POST /events/:slug/cohost-invites`). */
export const COHOST_INVITE_ROLES: CohostInviteOption[] = [
  {
    id: "greeter",
    labelKey: "gatherings:cohostInvite.role.greeter.label",
    descriptionKey: "gatherings:cohostInvite.role.greeter.description",
  },
  {
    id: "room_lead",
    labelKey: "gatherings:cohostInvite.role.room_lead.label",
    descriptionKey: "gatherings:cohostInvite.role.room_lead.description",
  },
  {
    id: "comoderator",
    labelKey: "gatherings:cohostInvite.role.comoderator.label",
    descriptionKey: "gatherings:cohostInvite.role.comoderator.description",
  },
  {
    id: "page_editor",
    labelKey: "gatherings:cohostInvite.role.page_editor.label",
    descriptionKey: "gatherings:cohostInvite.role.page_editor.description",
  },
];

/** How much time being a co-host is expected to take. */
export const COHOST_INVITE_COMMITMENTS: CohostInviteOption[] = [
  {
    id: "light",
    labelKey: "gatherings:cohostInvite.commitment.light.label",
    descriptionKey: "gatherings:cohostInvite.commitment.light.description",
  },
  {
    id: "half_event",
    labelKey: "gatherings:cohostInvite.commitment.half_event.label",
    descriptionKey: "gatherings:cohostInvite.commitment.half_event.description",
  },
  {
    id: "full_event",
    labelKey: "gatherings:cohostInvite.commitment.full_event.label",
    descriptionKey: "gatherings:cohostInvite.commitment.full_event.description",
  },
  {
    id: "ongoing",
    labelKey: "gatherings:cohostInvite.commitment.ongoing.label",
    descriptionKey: "gatherings:cohostInvite.commitment.ongoing.description",
  },
];
