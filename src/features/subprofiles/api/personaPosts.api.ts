import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  CreatePersonaPostBody,
  PersonaPostDTO,
  PersonaPostPageDTO,
  UpdatePersonaPostBody,
} from "./personaPosts.types";

// Persona posts (Studio v3 Phase F). Reads follow the persona page's own
// read access, logged-out viewers included for a public persona; writes are
// the persona's owners and co-owners.

const segment = (id: string) => encodeURIComponent(id);

export function getPersonaPosts(subprofileId: string, cursor: string | null) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiGet<PersonaPostPageDTO>(
    `/subprofiles/${segment(subprofileId)}/posts${query}`,
  );
}

export const createPersonaPost = (
  subprofileId: string,
  body: CreatePersonaPostBody,
) =>
  apiPost<PersonaPostDTO>(`/subprofiles/${segment(subprofileId)}/posts`, body);

export const updatePersonaPost = (
  postId: string,
  body: UpdatePersonaPostBody,
) => apiPatch<PersonaPostDTO>(`/subprofile-posts/${segment(postId)}`, body);

export const deletePersonaPost = (postId: string) =>
  apiDelete<void>(`/subprofile-posts/${segment(postId)}`);
