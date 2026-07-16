import { useEffect, useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { ACTIVISM_NAV, CONVICTION_ITEMS } from "./activism.data";
import {
  StartSection,
  LocalSection,
  SkillsSection,
  MobiliseSection,
  FeelSection,
  OrgsSection,
  VolunteerSection,
} from "./ActivismSections";
import s from "./ActivismPage.module.css";

export function ActivismPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState("start");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140;
      for (const { id } of ACTIVISM_NAV) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PageShell>
      <PageHero
        eyebrow={t("marketing:activism.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:activism.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:activism.hero.sub")}
      >
        <div className={s.conviction}>
          {CONVICTION_ITEMS.map((c) => (
            <div key={c.wordKey} className={s.convItem}>
              <div
                className="n"
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 26,
                  color: "var(--accent)",
                  marginBottom: 6,
                }}
              >
                {t(c.wordKey)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(247,243,238,.7)",
                  lineHeight: 1.55,
                }}
              >
                {t(c.restKey)}
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <div className="wrap">
        <div className={s.layout}>
          <nav className={s.nav}>
            <div className={s.navLabel}>
              {t("marketing:activism.nav.onThisPage")}
            </div>
            {ACTIVISM_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[s.navItem, active === item.id && s.navItemActive]
                  .filter(Boolean)
                  .join(" ")}
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>

          <div>
            <StartSection />
            <hr className={s.divider} />
            <LocalSection />
            <hr className={s.divider} />
            <SkillsSection />
            <hr className={s.divider} />
            <MobiliseSection />
            <hr className={s.divider} />
            <FeelSection />
            <hr className={s.divider} />
            <OrgsSection />
            <hr className={s.divider} />
            <VolunteerSection />
          </div>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="marketing:activism.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:activism.outro.sub")}
      >
        <Button size="lg" to={linkToPath("#board")}>
          {t("marketing:activism.outro.seeBoardCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
