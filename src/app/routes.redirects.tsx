import { Navigate, useLocation, useParams } from "react-router-dom";

/**
 * Merges the query string and hash the reader actually arrived with into a
 * legacy redirect's target.
 *
 * A few `LEGACY_REDIRECTS` targets carry query params of their own (e.g.
 * `/work/housing?tab=flatmates`), so the two sets are merged rather than
 * concatenated: the target's own params win, because the redirect table set
 * them deliberately, and everything the reader brought is appended after
 * them. The incoming hash wins over the target's, since only the reader's
 * can name a position in the page they were sent to.
 */
function mergeRedirectTarget(
  target: string,
  incomingSearch: string,
  incomingHash: string,
): string {
  const [beforeHash = "", ...hashRest] = target.split("#");
  const targetHash = hashRest.length > 0 ? `#${hashRest.join("#")}` : "";
  const [path = "", ...queryRest] = beforeHash.split("?");
  const mergedParams = new URLSearchParams(queryRest.join("?"));
  for (const [key, value] of new URLSearchParams(incomingSearch)) {
    if (!mergedParams.has(key)) mergedParams.append(key, value);
  }
  const query = mergedParams.toString();
  return `${path}${query ? `?${query}` : ""}${incomingHash || targetHash}`;
}

/**
 * A legacy path -> new home redirect that KEEPS the query string and hash.
 *
 * The plain `<Navigate to={to} replace />` this replaced dropped both, so an
 * old bookmark like `/article?id=some-slug` landed on `/magazine/article`
 * with no id at all and the reader got the "Article not found" wall. PRD-100.
 */
export function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return (
    <Navigate
      to={mergeRedirectTarget(to, location.search, location.hash)}
      replace
    />
  );
}

/** Generic redirect that forwards route params into a new target path. */
export function ParamRedirect({
  build,
}: {
  build: (p: Record<string, string | undefined>) => string;
}) {
  const params = useParams();
  return <Navigate to={build(params)} replace />;
}

/** Legacy public-profile path `/profile/:slug` → its new home `/members/:slug`. */
export function MemberProfileRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/members/${slug ?? ""}`} replace />;
}
