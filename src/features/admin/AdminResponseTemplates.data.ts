import type { ModResponseTemplateAdminDTO } from "./api/adminModResponseTemplates.api";

/**
 * Demo-mode fixture for the moderator response library. Live mode never reads
 * this file.
 *
 * A handful of rows rather than the empty fixture other admin panels use
 * (`adminOrgTiers.data.ts`): the point of this feature is the picker inside
 * the report drawer, and an empty picker in demo mode would show a reviewer
 * nothing at all. These four cover the shapes that matter: one keyed to a
 * reason and an action, one keyed to a reason only, one general closing note,
 * and one deactivated row so the admin screen's activation toggle has
 * something to demonstrate.
 */
export const ADMIN_RESPONSE_TEMPLATES_DEMO: ModResponseTemplateAdminDTO[] = [
  {
    id: "demo-template-dismiss",
    label: "Dismiss: nothing against the guidelines",
    body: "Thank you for reporting this. We read it properly and looked at the full context, and we did not find anything that breaks the community guidelines, so we are closing the report without acting on it. If this carries on or gets worse, report it again and say that you have reported it before.",
    reasonCode: null,
    actionCode: "dismiss",
    sortOrder: 0,
    isActive: true,
    createdByUserId: null,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "demo-template-harassment-warn",
    label: "Harassment: first warning",
    body: "Hi {member}. We reviewed a report about how you have been treating another member in {community}. Repeatedly going after one person breaks our guidelines on harassment, whatever started it. Please treat this as a formal warning: stop contacting them, and stop referring to them in public posts.",
    reasonCode: "harassment",
    actionCode: "warn",
    sortOrder: 1,
    isActive: true,
    createdByUserId: null,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "demo-template-outing-removed",
    label: "Outing: content removed",
    body: "Hi {member}. We removed your post in {community} because it revealed another member's identity without their consent. Outing someone can cost them their home, their job or their safety. Do not repost it in any form.",
    reasonCode: "outing",
    actionCode: null,
    sortOrder: 2,
    isActive: true,
    createdByUserId: null,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "demo-template-spam-removed",
    label: "Spam: promotional post removed",
    body: "Hi {member}. We removed your post in {community} because it was promotion rather than a contribution to the conversation. If you run something you would like members to know about, the directory is the place for it.",
    reasonCode: "spam",
    actionCode: "remove_content",
    sortOrder: 3,
    isActive: false,
    createdByUserId: null,
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
];
