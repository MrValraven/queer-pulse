/**
 * Frontend mirror of the backend STAFF_ROLES catalog (mirrored the same way
 * MemberRole mirrors the backend UserRole). Drives the admin "Roles & access"
 * toggle list. Add a role here + on the backend and it appears automatically.
 *
 * Ids must stay identical to `users/staff-roles.registry.ts` on the backend:
 * they travel on `/auth/me` and on the grant/revoke calls. The five domain
 * grants below (directory, resources, editorial, communities, partnerships)
 * open exactly the admin sections listed against them in
 * `shared/components/layout/adminNav.data.ts`; nothing else in the console
 * moves with them.
 */
export type StaffRoleId =
  | "magazine_editor"
  | "magazine_writer"
  | "housing_moderator"
  | "directory_moderator"
  | "resource_curator"
  | "editorial"
  | "communities"
  | "partnerships";

export interface StaffRoleMeta {
  id: StaffRoleId;
  labelKey: string;
  descriptionKey: string;
}

export const STAFF_ROLES: StaffRoleMeta[] = [
  {
    id: "magazine_editor",
    labelKey: "admin:staffRoles.magazineEditor.label",
    descriptionKey: "admin:staffRoles.magazineEditor.desc",
  },
  {
    id: "magazine_writer",
    labelKey: "admin:staffRoles.magazineWriter.label",
    descriptionKey: "admin:staffRoles.magazineWriter.desc",
  },
  {
    id: "housing_moderator",
    labelKey: "admin:staffRoles.housingModerator.label",
    descriptionKey: "admin:staffRoles.housingModerator.desc",
  },
  {
    id: "directory_moderator",
    labelKey: "admin:staffRoles.directoryModerator.label",
    descriptionKey: "admin:staffRoles.directoryModerator.desc",
  },
  {
    id: "resource_curator",
    labelKey: "admin:staffRoles.resourceCurator.label",
    descriptionKey: "admin:staffRoles.resourceCurator.desc",
  },
  {
    id: "editorial",
    labelKey: "admin:staffRoles.editorial.label",
    descriptionKey: "admin:staffRoles.editorial.desc",
  },
  {
    id: "communities",
    labelKey: "admin:staffRoles.communities.label",
    descriptionKey: "admin:staffRoles.communities.desc",
  },
  {
    id: "partnerships",
    labelKey: "admin:staffRoles.partnerships.label",
    descriptionKey: "admin:staffRoles.partnerships.desc",
  },
];

export const STAFF_ROLE_IDS = STAFF_ROLES.map((role) => role.id);

export function isStaffRoleId(value: string): value is StaffRoleId {
  return STAFF_ROLE_IDS.includes(value as StaffRoleId);
}
