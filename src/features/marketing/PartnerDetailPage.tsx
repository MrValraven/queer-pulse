import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePartner } from "./api/usePartner";
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

function PartnerDetailLoading() {
  return (
    <PageShell>
      <div className={s.page} aria-busy>
        <SkeletonLine width={110} height={14} />
        <header className={s.hero} style={{ marginTop: 24 }}>
          <SkeletonLine width={92} height={92} style={{ borderRadius: 18 }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width={180} height={12} />
            <SkeletonLine width="70%" height={40} style={{ marginTop: 14 }} />
            <SkeletonLine width="90%" height={16} style={{ marginTop: 14 }} />
          </div>
        </header>
      </div>
    </PageShell>
  );
}

export function PartnerDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [tab, setTab] = useState<PartnerTab>("about");

  const { data, isLoading, isError } = usePartner(slug);

  if (isLoading) return <PartnerDetailLoading />;

  // A non-approved partner is hidden: the mock registry misses it and the live
  // API 404s — both surface as `notFound`, which sends us back to the listing
  // (the not-found path), NOT an error screen.
  if (data?.notFound) return <Navigate to={routes.partners} replace />;

  const p = data?.partner;
  if (isError || !p) {
    return (
      <PageShell>
        <div className={s.page}>
          <p className={s.error}>{t("marketing:partnerDetail.loadError")}</p>
          <Button variant="ghost" to={routes.partners}>
            {t("marketing:partnerDetail.backCta")}
          </Button>
        </div>
      </PageShell>
    );
  }

  const { lead, last } = emName(p.name);

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.partners} className={s.back}>
          {t("marketing:partnerDetail.backCta")}
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
          <div>
            {tab === "about" && <PartnerAboutTab p={p} />}
            {tab === "work" && <PartnerWorkTab p={p} />}
            {tab === "timeline" && <PartnerTimelineTab p={p} />}
            {tab === "how" && <PartnerHowTab p={p} />}
          </div>

          <PartnerDetailSidebar p={p} />
        </div>
      </div>
    </PageShell>
  );
}
