import { subprofileEditPath } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaSectionHeader } from "./PersonaSectionHeader";
import type { SubprofileSection } from "./api/subprofiles.api";

/**
 * The events (or nights) section an owner sees on a Poster page before the
 * first event: the heading, then a dashed poster frame holding a ghost date
 * block, a line saying the first event goes here, and a button straight to
 * the editor pane for that section. Visitors never get it; an empty section
 * stays hidden from them. It is a `.pp-sec`, so it reveals like every other
 * section.
 */
export function EventsEmptyOwner({
  personaId,
  section,
  labelKey,
}: {
  personaId: string;
  section: SubprofileSection;
  labelKey: string;
}) {
  const { t } = useTranslation();
  // The editor moves a `section:` pane on to the chapter and field that edit
  // that section (`useEditorPane`), as the poems link does.
  const paneSearch = new URLSearchParams({
    pane: `section:${section}`,
  }).toString();
  return (
    <section
      className="pp-sec"
      data-section={section}
      data-preview-anchor={`section:${section}`}
      aria-labelledby={`pp-sec-${section}`}
    >
      <PersonaSectionHeader section={section} labelKey={labelKey} items={[]} />
      <div className="pp-ev-empty">
        <span className="pp-ev-date pp-ev-ghost" aria-hidden="true">
          <span className="pp-ev-dow" />
          <span className="pp-ev-day" />
          <span className="pp-ev-mon" />
        </span>
        <div className="pp-ev-empty-body">
          <p>{t("subprofiles:section.eventsEmptyOwner")}</p>
          <Button
            variant="primary"
            to={`${subprofileEditPath(personaId)}?${paneSearch}`}
          >
            {t("subprofiles:section.eventsAdd")}
          </Button>
        </div>
      </div>
    </section>
  );
}
