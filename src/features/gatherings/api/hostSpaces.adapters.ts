import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { HostSpace } from "../hostPage.data";
import type { PartnerSpaceDTO } from "./hostSpaces.api";

// Map the public `PartnerSpaceDTO` onto the `HostSpace` view model the sidebar
// renders. i18n scope: `spaceType` and `hostNote` are real business data (a
// venue's own description), left untranslated like the demo fixture's `note`;
// only the "up to N" capacity connector is chrome this adapter authors, so it
// resolves through `t()` (and formats the count via `fmt.number`).
export function spaceDtoToHostSpace(
  dto: PartnerSpaceDTO,
  t: TFunction,
  fmt: Formatters,
): HostSpace {
  const parts = [
    dto.spaceType,
    dto.capacity !== null
      ? t("gatherings:host.sidebar.capacity", {
          max: fmt.number(dto.capacity),
        })
      : null,
    dto.hostNote,
  ].filter((part): part is string => Boolean(part));

  return {
    slug: dto.slug,
    hood: dto.hood,
    name: dto.name,
    note: parts.join(" · "),
  };
}
