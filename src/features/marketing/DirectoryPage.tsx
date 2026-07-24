import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, FilterChips, Outro, Reveal } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useLocalPlaces } from "./api/useLocalPlaces";
import { filterLocalPlaces } from "./localPlaces";
import { LocalFilterBar } from "./LocalFilterBar";
import { DirectoryListView } from "./DirectoryListView";
import { DirectoryMapView } from "./DirectoryMapView";
import s from "./DirectoryPage.module.css";

export function DirectoryPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "map" ? "map" : "list";
  const places = useLocalPlaces();
  const loading = useSimulatedLoad();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [vibes, setVibes] = useState<string[]>([]);

  const filtered = useMemo(
    () => filterLocalPlaces(places, { category, query, vibes }),
    [places, category, query, vibes],
  );

  function selectView(next: string) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (next === "map") params.set("view", "map");
        else params.delete("view");
        return params;
      },
      { replace: false },
    );
  }

  function toggleVibe(vibe: string) {
    setVibes((current) =>
      current.includes(vibe)
        ? current.filter((entry) => entry !== vibe)
        : [...current, vibe],
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={t("marketing:directory.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:directory.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:directory.hero.sub")}
      >
        <div className={s.heroNote}>
          <span className={s.live} /> {t("marketing:directory.hero.note")}
        </div>
      </PageHero>

      <div className={s.viewToggle}>
        <FilterChips
          label={t("marketing:local.view.toggleAria")}
          options={[
            { value: "list", label: t("marketing:local.view.list") },
            { value: "map", label: t("marketing:local.view.map") },
          ]}
          value={view}
          onChange={selectView}
        />
      </div>

      <LocalFilterBar
        category={category}
        onCategoryChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        vibes={vibes}
        onToggleVibe={toggleVibe}
      />

      {view === "list" ? (
        <DirectoryListView
          places={filtered}
          total={places.length}
          loading={loading}
        />
      ) : (
        <DirectoryMapView places={filtered} loading={loading} />
      )}

      <section className={s.content}>
        <div className="wrap">
          <Reveal className={s.submitStrip}>
            <div>
              <h3>
                <Translation
                  i18nKey="marketing:directory.submitStrip.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("marketing:directory.submitStrip.body")}</p>
            </div>
            <Button size="lg" to={routes.listBusiness}>
              {t("marketing:directory.submitStrip.cta")}
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:directory.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:directory.outro.sub")}
      >
        <Button size="lg" to={routes.requestInvite}>
          {t("marketing:directory.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
