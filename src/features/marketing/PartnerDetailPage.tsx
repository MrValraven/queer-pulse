import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { getPartner } from "./partnerDetails";
import { routes } from "../../app/routeMap";
import {
  PartnerTabBar,
  PartnerAboutTab,
  PartnerWorkTab,
  PartnerTimelineTab,
  PartnerHowTab,
  type PartnerTab,
} from "./PartnerDetailTabs";
import { PartnerDetailSidebar } from "./PartnerDetailSidebar";
import s from "./PartnerDetailPage.module.css";

function emName(name: string) {
  const words = name.split(" ");
  const last = words.pop();
  return { lead: words.join(" "), last };
}

export function PartnerDetailPage() {
  const { slug } = useParams();
  const [tab, setTab] = useState<PartnerTab>("about");

  const p = getPartner(slug);
  if (!p) return <Navigate to={routes.partners} replace />;

  const { lead, last } = emName(p.name);

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.partners} className={s.back}>
          ← All partners
        </Link>

        <header className={s.hero}>
          <div className={s.logo}>{p.logo}</div>
          <div>
            <div className={s.eyebrow}>{p.eyebrow}</div>
            <h1 className={s.name}>
              {lead && `${lead} `}
              <em>{last}.</em>
            </h1>
            <p className={s.tagline}>{p.tagline}</p>
          </div>
          <div className={s.actions}>
            <span className={s.tier}>{p.tier}</span>
            <span className={s.since}>{p.since}</span>
          </div>
        </header>

        <PartnerTabBar p={p} tab={tab} setTab={setTab} />

        <div className={s.grid}>
          <main>
            {tab === "about" && <PartnerAboutTab p={p} />}
            {tab === "work" && <PartnerWorkTab p={p} />}
            {tab === "timeline" && <PartnerTimelineTab p={p} />}
            {tab === "how" && <PartnerHowTab p={p} />}
          </main>

          <PartnerDetailSidebar p={p} />
        </div>
      </div>
    </PageShell>
  );
}
