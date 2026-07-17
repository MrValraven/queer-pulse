// NOTE (i18n sweep — stored-value corruption trap): these chip labels are the
// literal *stored* value of draft.pronouns (joined into a comma-separated
// string on the Member record and read elsewhere — member profile display —
// outside this sweep's scope). Translating the label without a same-scope
// id/label-key split would silently desync the stored value from its own
// display in pt mode. Left in English on purpose; flagged in the sweep report
// for a coordinated follow-up.
export const PRONOUN_CHIPS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "any/all",
];

// Cosmetic, `comingSoon`-disabled control — defaultVal only ever matches one
// of the three static <option> labels rendered in VisibilitySection, and
// nothing here is persisted. Safe to route through i18n keys (Pattern A).
export type VisFieldOption = "members" | "connectionsOnly" | "hidden";

export interface VisField {
  nameKey: string;
  descKey: string;
  locked?: boolean;
  defaultVal: VisFieldOption;
}

export const VIS_FIELDS: VisField[] = [
  {
    nameKey: "settings:editProfile.visibility.field.displayName.name",
    descKey: "settings:editProfile.visibility.field.displayName.desc",
    locked: true,
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.photo.name",
    descKey: "settings:editProfile.visibility.field.photo.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.pronouns.name",
    descKey: "settings:editProfile.visibility.field.pronouns.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.bio.name",
    descKey: "settings:editProfile.visibility.field.bio.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.occupation.name",
    descKey: "settings:editProfile.visibility.field.occupation.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.location.name",
    descKey: "settings:editProfile.visibility.field.location.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.skills.name",
    descKey: "settings:editProfile.visibility.field.skills.desc",
    defaultVal: "members",
  },
  {
    nameKey: "settings:editProfile.visibility.field.link.name",
    descKey: "settings:editProfile.visibility.field.link.desc",
    defaultVal: "members",
  },
];
