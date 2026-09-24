import { useParams } from "react-router-dom";
import type { SubprofileKind } from "./api/subprofiles.api";
import { useSubprofile } from "./api/useSubprofile";

/**
 * The kind of the persona open in the editor, for fields that word their
 * helper copy per kind (a therapist's tagline, bio and booking button).
 *
 * Read from the editor route's `:id` through the same query
 * `SubprofileEditorPage` already resolved, so it is a cache hit and costs no
 * request. Undefined only while that query has no data, which the page never
 * renders the editor through.
 */
export function useEditorPersonaKind(): SubprofileKind | undefined {
  const { id } = useParams();
  const { data: subprofile } = useSubprofile(id);
  return subprofile?.kind;
}
