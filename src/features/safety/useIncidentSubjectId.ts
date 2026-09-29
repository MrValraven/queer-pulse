import { useState } from "react";

/**
 * This public form has no subject picker, so nothing a reporter types here
 * identifies a record. Sending free text as an id produced reports addressed to
 * things like "the guy from Friday", which no moderator can open and no
 * moderation action can attach to; the words read far better inside `detail`.
 *
 * So each incident gets its own `unlinked:<uuid>` id (ENG-483), minted once per
 * draft. A double tap or a retry of the same draft reuses it, so the server
 * still dedupes it, and a new incident after a successful filing gets a fresh
 * one. One shared id for every public report used to pool them all into a
 * single subject, which merged unrelated incidents and hit the per-subject cap.
 * Where `crypto.randomUUID` is unavailable this sends the legacy
 * `"unspecified"`, and the server mints the id itself.
 */
export function createUnlinkedSubjectId(): string {
  const cryptoObject = globalThis.crypto as Crypto | undefined;
  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return `unlinked:${cryptoObject.randomUUID()}`;
  }
  return "unspecified";
}

/**
 * Holds the current draft's incident subject id (see `createUnlinkedSubjectId`)
 * and exposes `renew` to mint a fresh one. The caller renews only after a
 * successful submit, so a retry of a failed or in-flight draft keeps reusing
 * the same id and still dedupes on the server.
 */
export function useIncidentSubjectId() {
  const [incidentSubjectId, setIncidentSubjectId] = useState(
    createUnlinkedSubjectId,
  );

  const renew = () => setIncidentSubjectId(createUnlinkedSubjectId());

  return { incidentSubjectId, renew };
}
