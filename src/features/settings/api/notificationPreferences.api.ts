import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The per-category notification switches, mirroring the backend
 * `NotificationPreferenceCategory` string values. Each maps to one toggle row in
 * the Notifications settings pane and gates every notification type behind it.
 */
export const NOTIFICATION_PREFERENCE_CATEGORY = {
  eventInvites: "event_invites",
  eventReminders: "event_reminders",
  eventActivity: "event_activity",
  newMessages: "new_messages",
  connections: "connections",
  communityReplies: "community_replies",
  communityPosts: "community_posts",
  communityAnnouncements: "community_announcements",
  topicFollows: "topic_follows",
  mentions: "mentions",
  vouches: "vouches",
  recognition: "recognition",
  personas: "personas",
  invitations: "invitations",
  listings: "listings",
  opportunities: "opportunities",
  magazine: "magazine",
} as const;

export type NotificationPreferenceCategory =
  (typeof NOTIFICATION_PREFERENCE_CATEGORY)[keyof typeof NOTIFICATION_PREFERENCE_CATEGORY];

/** Both channels default ON — a member with no stored override gets everything. */
export const DEFAULT_PREFERENCE_ENABLED = true;

export interface NotificationPreferenceState {
  inApp: boolean;
  push: boolean;
}

export interface NotificationPreferencesDTO {
  preferences: Record<string, NotificationPreferenceState>;
}

/** GET /me/notification-preferences — never 404s; returns every category's state. */
export const getNotificationPreferences = () =>
  apiGet<NotificationPreferencesDTO>("/me/notification-preferences");

/** PUT /me/notification-preferences — sets one category, echoes the full map. */
export const putNotificationPreference = (body: {
  category: NotificationPreferenceCategory;
  inApp: boolean;
  push: boolean;
}) => apiPut<NotificationPreferencesDTO>("/me/notification-preferences", body);
