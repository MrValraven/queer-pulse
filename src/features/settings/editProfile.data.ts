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
