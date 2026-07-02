import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import styles from "./CitiesPage.module.css";

// ---------------------------------------------------------------------------
// CityCardSkeleton — mirrors the real cityCard layout exactly so there is
// zero layout shift when real content replaces it.
// ---------------------------------------------------------------------------
export function CityCardSkeleton() {
  return (
    <div className={`${styles.cityCard} ${styles.skeletonCard}`} aria-hidden>
      {/* image block — 16/9 aspect ratio, same as .cityImg */}
      <div className={styles.skeletonImg} />
      <div className={styles.cityBody}>
        {/* city name + flag + status row */}
        <div className={styles.cityHRow}>
          <SkeletonLine width={120} height={32} style={{ borderRadius: 6 }} />
          <SkeletonLine
            width={70}
            height={14}
            style={{ borderRadius: 4, marginLeft: 14 }}
          />
          <SkeletonLine
            width={72}
            height={20}
            style={{ borderRadius: 5, marginLeft: "auto" }}
          />
        </div>
        {/* statsMini — 4 stats */}
        <div className={styles.statsMini}>
          <span>
            <SkeletonLine width={36} height={18} style={{ marginBottom: 4 }} />
            <SkeletonLine width={52} height={11} />
          </span>
          <span>
            <SkeletonLine width={36} height={18} style={{ marginBottom: 4 }} />
            <SkeletonLine width={80} height={11} />
          </span>
          <span>
            <SkeletonLine width={28} height={18} style={{ marginBottom: 4 }} />
            <SkeletonLine width={64} height={11} />
          </span>
          <span>
            <SkeletonLine width={20} height={18} style={{ marginBottom: 4 }} />
            <SkeletonLine width={88} height={11} />
          </span>
        </div>
        {/* dek — 3 lines */}
        <div style={{ flex: 1 }}>
          <SkeletonLine width="100%" height={13} style={{ marginBottom: 6 }} />
          <SkeletonLine width="96%" height={13} style={{ marginBottom: 6 }} />
          <SkeletonLine width="72%" height={13} />
        </div>
        {/* cta row */}
        <div className={styles.cityCta}>
          <SkeletonLine width={120} height={13} style={{ borderRadius: 4 }} />
          <SkeletonLine width={140} height={12} style={{ borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

export interface LiveCounts {
  lBonusCount: number;
  lGatherings: number;
  lSafeSpaces: number;
  lMagIssues: number;
  pMembers: number;
  pGatherings: number;
  pSafeSpaces: number;
  pPartners: number;
}

function LisbonCard({ counts }: { counts: LiveCounts }) {
  return (
    <FadeIn delay={0}>
      <div className={styles.cityCard}>
        <div className={styles.cityImg}>Lisbon · cityscape from Castelo</div>
        <div className={styles.cityBody}>
          <div className={styles.cityHRow}>
            <div className={styles.cityName}>
              Lisbon<em>.</em>
            </div>
            <span className={styles.cityFlag}>
              <span className={styles.dot}>🇵🇹</span>Portugal
            </span>
            <span className={`${styles.cityStatus} ${styles.statusLive}`}>
              Live · home
            </span>
          </div>
          <div className={styles.statsMini}>
            <span>
              <b>
                1,<em>{counts.lBonusCount.toLocaleString("en-US")}</em>
              </b>
              Members
            </span>
            <span>
              <b>
                <em>{counts.lGatherings}</em>
              </b>
              Gatherings · 2025
            </span>
            <span>
              <b>{counts.lSafeSpaces}</b>Safe spaces
            </span>
            <span>
              <b>
                <em>{counts.lMagIssues}</em>
              </b>
              Magazine issues
            </span>
          </div>
          <p className={styles.cityDek}>
            Where this all began.{" "}
            <b>Anjos, Mouraria, Graça, Alfama, Bairro Alto, Marvila</b> — the
            network is woven into the existing fabric. Operational partnerships
            with ILGA Portugal, Clínica do Largo, and Trans Hub. Café Beirão is
            the de facto headquarters.
          </p>
          <div className={styles.cityCta}>
            <span className={styles.link}>Browse Lisbon →</span>
            <span className={styles.lead}>
              Coordinated by <b>Marta Reis</b> &amp; <b>Catarina Vaz</b>
            </span>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function PortoCard({
  counts,
  showToast,
}: {
  counts: LiveCounts;
  showToast: ToastContextValue["showToast"];
}) {
  return (
    <FadeIn delay={60}>
      <button
        type="button"
        className={styles.cityCard}
        onClick={() => showToast("Porto opens publicly 12 Aug 2026", "info")}
      >
        <div className={`${styles.cityImg} ${styles.cityImgB}`}>
          Porto · Ribeira at dawn
        </div>
        <div className={styles.cityBody}>
          <div className={styles.cityHRow}>
            <div className={styles.cityName}>
              Porto<em>.</em>
            </div>
            <span className={styles.cityFlag}>
              <span className={styles.dot}>🇵🇹</span>Portugal
            </span>
            <span className={`${styles.cityStatus} ${styles.statusBeta}`}>
              Beta · 6 weeks
            </span>
          </div>
          <div className={styles.statsMini}>
            <span>
              <b>
                <em>{counts.pMembers}</em>
              </b>
              Members
            </span>
            <span>
              <b>{counts.pGatherings}</b>Gatherings · in flight
            </span>
            <span>
              <b>{counts.pSafeSpaces}</b>Safe spaces
            </span>
            <span>
              <b>
                <em>{counts.pPartners}</em>
              </b>
              Partners signed
            </span>
          </div>
          <p className={styles.cityDek}>
            Opening publicly <b>12 August 2026</b> after 18 months of quiet
            groundwork. Two in-Porto moderators, partner relationship with Rede
            Ex Aequo, and a hosting circle of nine members. The first public
            gathering is at Café Candelabro · 21 Aug.
          </p>
          <div className={styles.cityCta}>
            <span className={styles.link}>Join the Porto beta →</span>
            <span className={styles.lead}>
              Coordinated by <b>Filipa Lopes</b>
            </span>
          </div>
        </div>
      </button>
    </FadeIn>
  );
}

export function CitiesLiveGrid({
  loading,
  counts,
  showToast,
}: {
  loading: boolean;
  counts: LiveCounts;
  showToast: ToastContextValue["showToast"];
}) {
  return (
    <div className={styles.liveGrid}>
      {loading ? (
        <>
          <CityCardSkeleton />
          <CityCardSkeleton />
        </>
      ) : (
        <>
          <LisbonCard counts={counts} />
          <PortoCard counts={counts} showToast={showToast} />
        </>
      )}
    </div>
  );
}
