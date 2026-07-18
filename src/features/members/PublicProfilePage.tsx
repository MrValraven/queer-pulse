import { useParams } from "react-router-dom";
import { PublicProfileBySlug } from "./PublicProfileBySlug";
import { PublicProfileOwnPreview } from "./PublicProfileOwnPreview";

/**
 * The public-profile route, in its two forms.
 *
 * `/public-profile/:slug` is the real thing: a member's profile as the open web
 * reads it, fetched from the one member endpoint that answers without a session.
 * It renders fully for a logged-out visitor and is the one member surface that
 * should be indexable.
 *
 * `/public-profile` (no slug) stays what it has always been — the signed-in
 * member previewing their own. It needs a session to mean anything, so it can't
 * serve the logged-out case; that's what the slug form is for.
 *
 * Neither is in `GATED_PATTERNS` (see `src/app/authGate.ts`), so no sign-in
 * bounce applies. That matters most for the slug form: gating it would defeat
 * the entire point of a public profile.
 */
export function PublicProfilePage() {
  const { slug } = useParams();
  return slug ? (
    <PublicProfileBySlug slug={slug} />
  ) : (
    <PublicProfileOwnPreview />
  );
}
