import type { IconType } from "react-icons";
import { FiInbox, FiUser, FiUserCheck } from "react-icons/fi";
import { mediaMax } from "../../../shared/theme/breakpoints";
import type { AvatarTone } from "../ui";
import type { LeadAssignedToFilter } from "./api/leads.types";

/** Below this width the staff picker opens as a sheet. */
export const LEAD_ASSIGNEE_PHONE_QUERY = mediaMax("md");

/** The add and remove motion of an assignee row. */
export const LEAD_ASSIGNEE_MOTION_SECONDS = 0.2;
export const LEAD_ASSIGNEE_MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;

/** The initials tones a staff avatar picks from, by user id. */
export const LEAD_STAFF_AVATAR_TONES: readonly AvatarTone[] = [
  "plum",
  "coral",
  "jade",
  "violet",
  "amber",
];

/** The list's In charge view with no `assignedTo` param. */
export const LEAD_ASSIGNEE_EVERYONE = "everyone";
export type LeadAssigneeFilterValue =
  LeadAssignedToFilter | typeof LEAD_ASSIGNEE_EVERYONE;

/** The In charge segmented control, in order. */
export const LEAD_ASSIGNEE_FILTER_OPTIONS: readonly {
  value: LeadAssigneeFilterValue;
  labelKey: string;
}[] = [
  {
    value: LEAD_ASSIGNEE_EVERYONE,
    labelKey: "admin:leads.list.assignee.everyone",
  },
  { value: "me", labelKey: "admin:leads.list.assignee.me" },
  {
    value: "me_or_unassigned",
    labelKey: "admin:leads.list.assignee.me_or_unassigned",
  },
  { value: "unassigned", labelKey: "admin:leads.list.assignee.unassigned" },
];

export type LeadAssigneeEmptyViewName =
  "emptyMine" | "emptyMineAndUnassigned" | "emptyUnassigned";

/** The empty state an In charge view shows when it is the only filter. */
export const LEAD_ASSIGNEE_EMPTY_VIEW: Record<
  LeadAssignedToFilter,
  LeadAssigneeEmptyViewName
> = {
  me: "emptyMine",
  me_or_unassigned: "emptyMineAndUnassigned",
  unassigned: "emptyUnassigned",
};

export const LEAD_ASSIGNEE_EMPTY_COPY: Record<
  LeadAssigneeEmptyViewName,
  { titleKey: string; bodyKey: string | null; icon: IconType }
> = {
  emptyMine: {
    titleKey: "admin:leads.empty.mine.title",
    bodyKey: "admin:leads.empty.mine.body",
    icon: FiUser,
  },
  emptyMineAndUnassigned: {
    titleKey: "admin:leads.empty.mineAndUnassigned.title",
    bodyKey: null,
    icon: FiInbox,
  },
  emptyUnassigned: {
    titleKey: "admin:leads.empty.unassigned.title",
    bodyKey: null,
    icon: FiUserCheck,
  },
};
