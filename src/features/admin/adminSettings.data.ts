/**
 * Preset metadata for the two message fields. These carry catalog KEYS, not
 * text: selecting a preset resolves `bodyKey` through `t()` and fills the
 * textarea, and the saved value is whatever free text the admin ends up with.
 * The backend has no knowledge of presets.
 */
export interface MessagePreset {
  id: string;
  labelKey: string;
  bodyKey: string;
}

export const LOCKDOWN_PRESETS: MessagePreset[] = [
  {
    id: "scheduled",
    labelKey: "admin:settings.presets.lockdown.scheduled.label",
    bodyKey: "admin:settings.presets.lockdown.scheduled.body",
  },
  {
    id: "emergency",
    labelKey: "admin:settings.presets.lockdown.emergency.label",
    bodyKey: "admin:settings.presets.lockdown.emergency.body",
  },
  {
    id: "security",
    labelKey: "admin:settings.presets.lockdown.security.label",
    bodyKey: "admin:settings.presets.lockdown.security.body",
  },
  {
    id: "spam",
    labelKey: "admin:settings.presets.lockdown.spam.label",
    bodyKey: "admin:settings.presets.lockdown.spam.body",
  },
  {
    id: "deploy",
    labelKey: "admin:settings.presets.lockdown.deploy.label",
    bodyKey: "admin:settings.presets.lockdown.deploy.body",
  },
  {
    id: "safety",
    labelKey: "admin:settings.presets.lockdown.safety.label",
    bodyKey: "admin:settings.presets.lockdown.safety.body",
  },
];

export const CLOSED_PRESETS: MessagePreset[] = [
  {
    id: "spam",
    labelKey: "admin:settings.presets.closed.spam.label",
    bodyKey: "admin:settings.presets.closed.spam.body",
  },
  {
    id: "capacity",
    labelKey: "admin:settings.presets.closed.capacity.label",
    bodyKey: "admin:settings.presets.closed.capacity.body",
  },
  {
    id: "review",
    labelKey: "admin:settings.presets.closed.review.label",
    bodyKey: "admin:settings.presets.closed.review.body",
  },
];

/** Audit `settingKey` → catalog key for a human label in the History tab. */
export const SETTING_LABEL_KEYS: Record<string, string> = {
  registrationEnabled: "admin:settings.key.registrationEnabled",
  joinRequestsEnabled: "admin:settings.key.joinRequestsEnabled",
  lockdownEnabled: "admin:settings.key.lockdownEnabled",
  lockdownAllowsModerators: "admin:settings.key.lockdownAllowsModerators",
  lockdownMessage: "admin:settings.key.lockdownMessage",
  registrationClosedMessage: "admin:settings.key.registrationClosedMessage",
  announcementEnabled: "admin:settings.key.announcementEnabled",
  announcementMessage: "admin:settings.key.announcementMessage",
  announcementExpiresAt: "admin:settings.key.announcementExpiresAt",
};
