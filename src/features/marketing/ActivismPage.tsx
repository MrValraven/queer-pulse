import { useEffect, useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
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
        eyebrow="Activism & community action"
        title={
          <>
            Your activism <em>matters</em> — even when it doesn't feel like it.
          </>
        }
        sub="Community action is not just for full-time activists. It's for the person who shows up, who uses their skills, who makes their neighbourhood a little better. This page is for you."
      >
        <div className={s.conviction}>
          {CONVICTION_ITEMS.map((c) => (
            <div key={c.n} className={s.convItem}>
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
                {c.n}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(247,243,238,.7)",
                  lineHeight: 1.55,
                }}
              >
                {c.l}
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <div className="wrap">
        <div className={s.layout}>
          <nav className={s.nav}>
            <div className={s.navLabel}>On this page</div>
            {ACTIVISM_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[s.navItem, active === item.id && s.navItemActive]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
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
          <>
            Want to make something <em>happen?</em>
          </>
        }
        sub="Post it on the board. Find collaborators in the network. Start small. Start now."
      >
        <Button size="lg" to="/#board">
          See the board
        </Button>
      </Outro>
    </PageShell>
  );
}
