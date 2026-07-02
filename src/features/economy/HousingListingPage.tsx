import { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { getListing } from "./housingListings";
import { GAL_BG } from "./housingListing.data";
import { MessageModal } from "./HousingModals";
import { HousingListingSkeleton } from "./HousingListingSkeleton";
import {
  HousingListingMain,
  HousingListingSidebar,
} from "./HousingListingSections";
import s from "./HousingListingPage.module.css";

export function HousingListingPage() {
  const { slug } = useParams();
  const [messaging, setMessaging] = useState(false);
  const loading = useSimulatedLoad();

  const l = getListing(slug);
  if (!l) return <Navigate to={routes.housing} replace />;

  if (loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            ← Housing board
          </Link>
          <HousingListingSkeleton />
        </div>
      </PageShell>
    );
  }

  const first = l.poster.fullName.split(" ")[0] ?? l.poster.fullName;

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>
          ← Housing board
        </Link>

        <FadeIn>
          <div className={s.gallery}>
            {l.gallery.map((cap, i) => (
              <div
                key={i}
                className={s.gCell}
                style={{ background: GAL_BG[l.tint] }}
              >
                <span className={s.gCap}>{cap}</span>
              </div>
            ))}
          </div>

          <header className={s.head}>
            <span
              className={s.type}
              style={{ background: l.typeColor, color: l.typeText }}
            >
              {l.typeLabel}
            </span>
            <h1 className={s.title}>{l.title}</h1>
            <div className={s.metaRow}>
              <span className={s.metaPill}>
                <FiMapPin /> {l.hood}
              </span>
              <span className={s.metaPill}>{l.beds}</span>
              <span className={s.metaPill}>From {l.avail}</span>
              <span className={s.metaPill}>
                {l.price} / {l.period}
              </span>
            </div>
          </header>

          <div className={s.grid}>
            <HousingListingMain l={l} />
            <HousingListingSidebar
              l={l}
              first={first}
              onMessage={() => setMessaging(true)}
            />
          </div>
        </FadeIn>
      </div>

      {messaging && (
        <MessageModal
          toName={l.poster.fullName}
          listingTitle={l.title}
          responseTime={l.poster.responseTime}
          onClose={() => setMessaging(false)}
        />
      )}
    </PageShell>
  );
}
