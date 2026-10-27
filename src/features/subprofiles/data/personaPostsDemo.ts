import { ApiError } from "../../../shared/api/client";
import {
  PERSONA_POST,
  type CreatePersonaPostBody,
  type PersonaPostDTO,
  type PersonaPostPageDTO,
  type UpdatePersonaPostBody,
} from "../api/personaPosts.types";
import { DEMO_PERSONA_POSTS } from "./personaPosts.data";

/** Small on purpose, so the demo exercises "Show more updates" twice. */
export const DEMO_PERSONA_POST_PAGE_SIZE = 4;
const DAY_MS = 86_400_000;

const postsByPersona = new Map<string, PersonaPostDTO[]>(
  Object.entries(DEMO_PERSONA_POSTS).map(([id, posts]) => [id, [...posts]]),
);

/** Every post made, deleted ones included, as the server's quota ledger
 *  counts them: deleting and posting again never resets the day's limit. */
const createdAtByPersona = new Map<string, number[]>();

const refusal = (status: number, code: string) =>
  new ApiError(status, code, { statusCode: status, code, message: code });

/** As the server: a post link is https or nothing, up to 1000 characters
 *  (400 otherwise). */
function assertLink(linkUrl: string | null | undefined): void {
  if (!linkUrl) return;
  if (!/^https:\/\//i.test(linkUrl) || linkUrl.length > PERSONA_POST.linkMax)
    throw refusal(400, "bad_request");
}

/** As the server: the body is trimmed and holds 1 to 500 characters. */
function checkedBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0 || trimmed.length > PERSONA_POST.bodyMax)
    throw refusal(400, "bad_request");
  return trimmed;
}

/** The blob URLs this store made itself: the only ones it revokes. */
const ownBlobUrls = new Set<string>();

/** The demo image key is the picked photo's local blob URL, which the photo
 *  field revokes once it unmounts. A blob key gets the store's own copy, so
 *  the post keeps showing its photo; any other key passes through, and so
 *  does a blob the store can no longer read. */
export async function demoOwnImageUrl(
  imageKey: string | null | undefined,
): Promise<string | null | undefined> {
  if (!imageKey?.startsWith("blob:")) return imageKey;
  try {
    const picked = await (await fetch(imageKey)).blob();
    const copy = URL.createObjectURL(new Blob([picked], { type: picked.type }));
    ownBlobUrls.add(copy);
    return copy;
  } catch {
    return imageKey;
  }
}

/** How long a replaced or deleted photo stays readable: longer than the
 *  card's exit animation, so a fading card never flashes a broken image. */
export const OWN_IMAGE_REVOKE_DELAY_MS = 2000;

/** Frees the store's own copy of a photo once no post shows it, after the
 *  card that showed it has finished leaving. */
function releaseOwnImage(imageUrl: string | null): void {
  if (!imageUrl || !ownBlobUrls.has(imageUrl)) return;
  ownBlobUrls.delete(imageUrl);
  setTimeout(() => URL.revokeObjectURL(imageUrl), OWN_IMAGE_REVOKE_DELAY_MS);
}

function ownerOf(postId: string): string | null {
  for (const [personaId, posts] of postsByPersona)
    if (posts.some((post) => post.id === postId)) return personaId;
  return null;
}

/** Creation times of deleted posts, so a page cursor naming a post deleted
 *  since still finds its place in the list. */
const deletedCreatedAtById = new Map<string, number>();

/** The posts after the cursor post in a newest-first list. The cursor is
 *  the last post's id, so a post added on top or removed from a loaded page
 *  moves no later page. An unknown id starts from the top. */
function postsAfterCursor(
  posts: PersonaPostDTO[],
  cursor: string | null,
): PersonaPostDTO[] {
  if (!cursor) return posts;
  const index = posts.findIndex((post) => post.id === cursor);
  if (index >= 0) return posts.slice(index + 1);
  const deletedCreatedAt = deletedCreatedAtById.get(cursor);
  if (deletedCreatedAt === undefined) return posts;
  return posts.filter((post) => Date.parse(post.createdAt) < deletedCreatedAt);
}

/** GET /subprofiles/:id/posts in the demo, newest first, cursor = the id of
 *  the previous page's last post. */
export function demoPersonaPostsPage(
  subprofileId: string,
  cursor: string | null,
): PersonaPostPageDTO {
  const remaining = postsAfterCursor(
    postsByPersona.get(subprofileId) ?? [],
    cursor,
  );
  const items = remaining.slice(0, DEMO_PERSONA_POST_PAGE_SIZE);
  const hasMore = remaining.length > items.length;
  const lastPost = items.at(-1);
  return {
    items,
    pageInfo: {
      nextCursor: hasMore && lastPost ? lastPost.id : null,
      hasMore,
    },
  };
}

/** POST in the demo: the server's length and link rules, the rolling
 *  24-hour limit (deleted posts count), then the post on top. The demo image
 *  key is the picked photo's local URL, so the store's copy of it doubles as
 *  the image URL. */
export async function demoCreatePersonaPost(
  subprofileId: string,
  body: CreatePersonaPostBody,
): Promise<PersonaPostDTO> {
  const text = checkedBody(body.body);
  assertLink(body.linkUrl);
  const since = Date.now() - DAY_MS;
  const made = [
    ...(postsByPersona.get(subprofileId) ?? []).map((post) =>
      Date.parse(post.createdAt),
    ),
    ...(createdAtByPersona.get(subprofileId) ?? []),
  ].filter((createdAt) => createdAt > since);
  if (made.length >= PERSONA_POST.dailyLimit)
    throw refusal(429, "persona_post_daily_limit");
  const imageUrl = await demoOwnImageUrl(body.imageKey);
  // Read again after the copy, so a write that landed meanwhile stays.
  const posts = postsByPersona.get(subprofileId) ?? [];
  const post: PersonaPostDTO = {
    id: `demo-post-${Date.now()}-${posts.length + 1}`,
    body: text,
    linkUrl: body.linkUrl || null,
    imageUrl: imageUrl ?? null,
    createdAt: new Date().toISOString(),
    editedAt: null,
    canEdit: true,
  };
  postsByPersona.set(subprofileId, [post, ...posts]);
  return post;
}

/** Keeps a deleted post's creation time in the day's count. */
function rememberCreation(personaId: string, createdAt: string): void {
  createdAtByPersona.set(personaId, [
    ...(createdAtByPersona.get(personaId) ?? []),
    Date.parse(createdAt),
  ]);
}

/** The demo post the caller may edit, with its persona, else the server's
 *  404. */
function editablePost(postId: string): {
  personaId: string;
  current: PersonaPostDTO;
} {
  const personaId = ownerOf(postId);
  const current = personaId
    ? postsByPersona.get(personaId)?.find((post) => post.id === postId)
    : undefined;
  if (!personaId || !current || !current.canEdit)
    throw refusal(404, "not_found");
  return { personaId, current };
}

export async function demoUpdatePersonaPost(
  postId: string,
  body: UpdatePersonaPostBody,
): Promise<PersonaPostDTO> {
  editablePost(postId);
  const text = body.body === undefined ? undefined : checkedBody(body.body);
  assertLink(body.linkUrl);
  const imageUrl = await demoOwnImageUrl(body.imageKey);
  // Read again after the copy: the post may have gone meanwhile.
  const { personaId, current } = editablePost(postId);
  const next: PersonaPostDTO = {
    ...current,
    body: text ?? current.body,
    linkUrl:
      body.linkUrl === undefined ? current.linkUrl : body.linkUrl || null,
    imageUrl: imageUrl === undefined ? current.imageUrl : imageUrl,
    editedAt: new Date().toISOString(),
  };
  postsByPersona.set(
    personaId,
    (postsByPersona.get(personaId) ?? []).map((post) =>
      post.id === postId ? next : post,
    ),
  );
  // An edit that replaced or cleared the photo frees the old copy.
  if (next.imageUrl !== current.imageUrl) releaseOwnImage(current.imageUrl);
  return next;
}

/** Takes a post out of the store, keeping its creation time for the day's
 *  count and for page cursors that name it. */
function dropPost(personaId: string, current: PersonaPostDTO): void {
  rememberCreation(personaId, current.createdAt);
  deletedCreatedAtById.set(current.id, Date.parse(current.createdAt));
  postsByPersona.set(
    personaId,
    (postsByPersona.get(personaId) ?? []).filter(
      (post) => post.id !== current.id,
    ),
  );
  releaseOwnImage(current.imageUrl);
}

export function demoDeletePersonaPost(postId: string): void {
  const { personaId, current } = editablePost(postId);
  dropPost(personaId, current);
}

/** Staff "Remove post" in the demo: the post leaves the store whoever owns
 *  it, so the persona page and Studio stop showing it. An unknown id is a
 *  no-op (the post is already gone). */
export function demoRemovePersonaPostByStaff(postId: string): void {
  const personaId = ownerOf(postId);
  const current = personaId
    ? postsByPersona.get(personaId)?.find((post) => post.id === postId)
    : undefined;
  if (personaId && current) dropPost(personaId, current);
}
