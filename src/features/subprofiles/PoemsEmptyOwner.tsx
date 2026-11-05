import { subprofileEditPath } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaSectionHeader } from "./PersonaSectionHeader";

/** The editor pane a poems link names. The editor moves it on to the Page
 *  blocks chapter and field that edit the poems (`useEditorPane`). */
const POEMS_PANE_SEARCH = new URLSearchParams({
  pane: "section:poems",
}).toString();

/**
 * The poems section an owner sees before they have written any: the heading,
 * a quiet line saying their poems will be listed here, and a link straight to
 * the editor's poems field. Visitors never get it; an empty section stays
 * hidden from them. It is a `.pp-sec`, so it reveals like every other section.
 */
export function PoemsEmptyOwner({
  personaId,
  labelKey,
}: {
  personaId: string;
  labelKey: string;
}) {
  const { t } = useTranslation();
  return (
    <section
      className="pp-sec"
      data-section="poems"
      data-preview-anchor="section:poems"
      aria-labelledby="pp-sec-poems"
    >
      <PersonaSectionHeader section="poems" labelKey={labelKey} items={[]} />
      <div className="pp-empty-owner">
        <p>{t("subprofiles:section.poemsEmptyOwner")}</p>
        <Button
          variant="ghost"
          size="sm"
          to={`${subprofileEditPath(personaId)}?${POEMS_PANE_SEARCH}`}
        >
          {t("subprofiles:section.poemsAdd")}
        </Button>
      </div>
    </section>
  );
}
