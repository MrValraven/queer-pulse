import { NOTIFICATION_PREFERENCE_CATEGORY } from "./api/notificationPreferences.api";
import type { NotificationPreferenceCategory } from "./api/notificationPreferences.api";

/**
 * The member-facing grouping of notification categories, mirroring the backend's
 * `NotificationPreferenceCategory`.
 *
 * SOC-10's finding was that preferences covered eleven notification types across
 * seven categories while sixty more were unmutable, so a member in five busy
 * communities could only turn the volume down by leaving them. The answer is not
 * a switch per type: seventy-odd switches is another way of offering no control.
 * It is a grouping where every genuinely noisy type sits behind one switch a
 * member can find. What stays unmutable after this is safety, account lifecycle,
 * governance of a room you belong to, and the outcome of something you asked
 * for, which is documented type by type in the backend's
 * `ALWAYS_DELIVERED_NOTIFICATION_TYPES`.
 *
 * Stable category ids, never the translated label: the label resolves through
 * `titleKey`/`descKey` at render time.
 */
export interface NotificationCategoryRow {
  category: NotificationPreferenceCategory;
  titleKey: string;
  descKey: string;
}

export interface NotificationCategoryGroup {
  /** Stable id, used as the React key and the section's heading key suffix. */
  id: string;
  labelKey: string;
  rows: NotificationCategoryRow[];
}

const row = (
  category: NotificationPreferenceCategory,
  id: string,
): NotificationCategoryRow => ({
  category,
  titleKey: `settings:notifications.volume.${id}.title`,
  descKey: `settings:notifications.volume.${id}.desc`,
});

/**
 * Every switched category, grouped the way a member thinks about their own
 * attention rather than the way the backend files notification types.
 */
export const NOTIFICATION_CATEGORY_GROUPS: NotificationCategoryGroup[] = [
  {
    id: "gatherings",
    labelKey: "settings:notifications.section.gatherings",
    rows: [
      row(NOTIFICATION_PREFERENCE_CATEGORY.eventInvites, "eventInvites"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.eventReminders, "eventReminders"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.eventActivity, "eventActivity"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.eventCapacity, "eventCapacity"),
    ],
  },
  {
    id: "people",
    labelKey: "settings:notifications.section.messagesConnections",
    rows: [
      row(NOTIFICATION_PREFERENCE_CATEGORY.newMessages, "newMessages"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.connections, "connections"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.vouches, "vouches"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.invitations, "invitations"),
    ],
  },
  {
    id: "discussion",
    labelKey: "settings:notifications.section.communitiesBoard",
    rows: [
      row(NOTIFICATION_PREFERENCE_CATEGORY.mentions, "mentions"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.communityReplies, "replies"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.communityPosts, "posts"),
      row(
        NOTIFICATION_PREFERENCE_CATEGORY.communityAnnouncements,
        "announcements",
      ),
      row(NOTIFICATION_PREFERENCE_CATEGORY.topicFollows, "topicFollows"),
      // PRD-208. Sits beside "topics I follow" because it is the same kind of
      // switch: something you asked to hear about, from somebody else's work.
      // It is also the ONLY thing following a persona ever sends, so this is
      // the row that makes following safe to try.
      row(NOTIFICATION_PREFERENCE_CATEGORY.personaFollows, "personaFollows"),
    ],
  },
  {
    id: "yourWork",
    labelKey: "settings:notifications.section.yourWork",
    rows: [
      row(NOTIFICATION_PREFERENCE_CATEGORY.recognition, "recognition"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.personas, "personas"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.listings, "listings"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.opportunities, "opportunities"),
      row(NOTIFICATION_PREFERENCE_CATEGORY.magazine, "magazine"),
    ],
  },
];
