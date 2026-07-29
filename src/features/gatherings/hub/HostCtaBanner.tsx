import { Button, Outro } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";

/**
 * The Highlights tab's closing CTA. Reuses the shared `Outro` primitive —
 * the same full-bleed plum band, Fraunces title with a coral `<em>` slot, and
 * `ghost-dark` button — rather than duplicating that CSS; `HostPage` and the
 * old `GatheringsPage` landing already point members at hosting the same way.
 */
export function HostCtaBanner() {
  const { t } = useTranslation();
  return (
    <Outro
      title={
        <Translation
          i18nKey="gatherings:hub.host.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:hub.host.body")}
    >
      <Button to={routes.host} variant="ghost-dark" size="lg">
        {t("gatherings:hub.host.cta")}
      </Button>
    </Outro>
  );
}
