/**
 * Frontend mirror of the backend STAFF_ROLES catalog (mirrored the same way
 * MemberRole mirrors the backend UserRole). Drives the admin "Roles & access"
 * toggle list. Add a role here + on the backend and it appears automatically.
 */
export type StaffRoleId = "magazine_editor" | "magazine_writer";

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
];

export const STAFF_ROLE_IDS = STAFF_ROLES.map((role) => role.id);

export function isStaffRoleId(value: string): value is StaffRoleId {
  return STAFF_ROLE_IDS.includes(value as StaffRoleId);
}
