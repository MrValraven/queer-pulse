import { Navigate, useParams } from "react-router-dom";

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
