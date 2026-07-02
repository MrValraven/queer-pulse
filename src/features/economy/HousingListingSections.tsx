import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Avatar, Button } from "../../shared/components/ui";
import { HOUSING_LISTINGS, type HousingListing } from "./housingListings";
import { GAL_BG } from "./housingListing.data";
import s from "./HousingListingPage.module.css";

export function HousingListingMain({ l }: { l: HousingListing }) {
  return (
    <main>
      <section className={s.sec}>
        <h2>About this place</h2>
        {l.longDesc.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={s.sec}>
        <h2>Features</h2>
        <div className={s.features}>
          {l.features.map((f) => (
            <span key={f} className={s.feature}>
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>The facts</h2>
        <div className={s.facts}>
          {l.facts.map((f) => (
            <div key={f.label} className={s.factRow}>
              <span>{f.label}</span>
              <b>{f.value}</b>
            </div>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>Ideal for</h2>
        <div className={s.bullets}>
          {l.idealFor.map((b) => (
            <div key={b} className={s.bullet}>
              <div className={s.bulletDot} />
              {b}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function HousingListingSidebar({
  l,
  first,
  onMessage,
}: {
  l: HousingListing;
  first: string;
  onMessage: () => void;
}) {
  const similar = HOUSING_LISTINGS.filter((x) => x.slug !== l.slug).slice(0, 3);
  return (
    <aside className={s.side}>
      <div className={s.priceCard}>
        <div className={s.priceBig}>
          {l.price} <span>/ {l.period}</span>
        </div>
        <div className={s.priceMeta}>
          Available from {l.avail} · posted by a verified member
        </div>
        <Button variant="ghost-dark" className={s.priceBtn} onClick={onMessage}>
          Message {first} →
        </Button>
      </div>

      <div className={s.sideCard}>
        <h4>Listed by</h4>
        <div className={s.lister}>
          <Avatar initials={l.poster.initials} tint={l.poster.tint} size={44} />
          <div>
            <div className={s.listerName}>{l.poster.fullName}</div>
            <div className={s.listerSince}>{l.poster.memberSince}</div>
          </div>
        </div>
        <span className={s.verifiedRow}>Verified member</span>
        <p className={s.listerBio}>{l.poster.bio}</p>
        <div className={s.replyRow}>
          Usually replies <b>{l.poster.responseTime}</b>
        </div>
        <Button variant="primary" className={s.sideFull} onClick={onMessage}>
          Message {first}
        </Button>
      </div>

      <div className={s.sideCard}>
        <h4>Stay safe</h4>
        <div className={s.safety}>
          <b>Never pay a deposit before viewing in person.</b> Keep the
          conversation on QueerPulse until you've met. If something feels off,
          the Queer Housing Justice Network can advise.
        </div>
      </div>

      <div className={s.sideCard}>
        <h4>More on the board</h4>
        <div className={s.more}>
          {similar.map((x) => (
            <Link
              key={x.slug}
              to={`${routes.housing}/${x.slug}`}
              className={s.moreItem}
            >
              <div
                className={s.moreThumb}
                style={{ background: GAL_BG[x.tint] }}
              />
              <div>
                <div className={s.moreName}>{x.title}</div>
                <div className={s.morePrice}>
                  {x.price} / {x.period} · {x.hood}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
