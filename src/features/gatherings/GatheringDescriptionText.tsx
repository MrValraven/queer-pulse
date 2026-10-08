import { ResolvedMentionText } from "../../shared/mentions/ResolvedMentionText";

/**
 * A gathering's description as the host wrote it, with its `@member`,
 * `b/business`, `e/`, `c/`, `#` and `t/` mentions shown as names that link to
 * what they point at. Names resolve the same way a bio's do: one request for
 * exactly the refs the text holds in live mode, the demo registries in demo.
 *
 * It renders inline runs only, so the element around it keeps owning the look:
 * a `white-space: pre-wrap` parent still shows the host's line breaks and
 * paragraphs, and a line clamp still cuts the text where it did.
 *
 * `isLinkified={false}` keeps the mention styling as inert text, for a surface
 * where following a link would leave work behind (the create flow's preview).
 */
export function GatheringDescriptionText({
  text,
  isLinkified = true,
}: {
  text: string;
  isLinkified?: boolean;
}) {
  return <ResolvedMentionText text={text} linkify={isLinkified} />;
}
