import { FiChevronRight } from "react-icons/fi";

/**
 * "Parent, Space" label for a community that is a space (subcommunity),
 * shown visually as the parent name, a chevron, then the space's own name.
 *
 * Renders `name` alone when `parentName` is null, which covers every
 * top-level community unchanged. Otherwise it renders the parent name, a
 * decorative `FiChevronRight`, then the space's own name, with a
 * visually-hidden comma between them so a screen reader does not run the
 * two names together: the whole label reads as "Parent, Space".
 */
export function SpaceLabel({
  parentName,
  name,
}: {
  parentName: string | null;
  name: string;
}) {
  if (!parentName) return <>{name}</>;
  return (
    <span>
      {parentName}
      <span className="visuallyHidden">, </span>
      <FiChevronRight aria-hidden style={{ verticalAlign: "-1px" }} />
      {name}
    </span>
  );
}
