import type { Member } from "../members/data/members";

/* Non-component helper split out of SettingsPanes.tsx so that file only exports
 * components (react-refresh/only-export-components). */

// Pattern B: the export titles/notes are platform chrome (shown in the modal
// and baked into the downloaded JSON's own copy), so they resolve via `t`.
export function buildExports(
  t: (key: string) => string,
  email: string,
  name: string,
  profile: Member,
) {
  return {
    full: {
      title: t("settings:data.export.full.title"),
      filename: "queerpulse-export.json",
      payload: {
        account: { name, email },
        profile: {
          pronouns: profile.pronouns ?? "",
          city: profile.hood,
          interests: profile.tags,
        },
        exportedAt: new Date().toISOString(),
      },
    },
    messages: {
      title: t("settings:data.export.messages.title"),
      filename: "queerpulse-messages.json",
      payload: {
        account: name,
        note: t("settings:data.export.messages.note"),
        exportedAt: new Date().toISOString(),
      },
    },
  } as const;
}
