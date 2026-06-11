import { PageShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { GroundworkSection, HowSection, WaitlistSection } from './CitiesSections'
import styles from './CitiesPage.module.css'

export function CitiesPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Cities · network footprint · selector</div>
          <h1 className={styles.h1}>
            One city at a <em>time.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse is rooted in Lisbon. We will only open in a new city when there is{' '}
            <b>at least one moderator in-country</b>, a partner organisation aligned, and a clear
            local need. <em>That makes expansion slow on purpose.</em> Below: where we are now,
            where we're building, and how you can pull us toward your city.
          </p>
          <div className={styles.current}>
            <div className={styles.currentIc}>
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className={styles.currentText}>
              <b>You're browsing as</b>
              <span>Lisbon, Portugal</span>
            </div>
            <button
              type="button"
              className={styles.currentBtn}
              onClick={() =>
                showToast('Detected from IP. You can switch from any city card below.', 'info')
              }
            >
              Change
            </button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section>
          <div className={styles.secH}>
            <h2>
              Live · <em>fully operational</em>
            </h2>
            <span className={styles.meta}>Active community, moderators, partner orgs</span>
          </div>
          <div className={styles.liveGrid}>
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
                  <span className={`${styles.cityStatus} ${styles.statusLive}`}>Live · home</span>
                </div>
                <div className={styles.statsMini}>
                  <span>
                    <b>
                      1,<em>612</em>
                    </b>
                    Members
                  </span>
                  <span>
                    <b>
                      <em>284</em>
                    </b>
                    Gatherings · 2025
                  </span>
                  <span>
                    <b>42</b>Safe spaces
                  </span>
                  <span>
                    <b>
                      <em>9</em>
                    </b>
                    Magazine issues
                  </span>
                </div>
                <p className={styles.cityDek}>
                  Where this all began. <b>Anjos, Mouraria, Graça, Alfama, Bairro Alto, Marvila</b>{' '}
                  — the network is woven into the existing fabric. Operational partnerships with
                  ILGA Portugal, Clínica do Largo, and Trans Hub. Café Beirão is the de facto
                  headquarters.
                </p>
                <div className={styles.cityCta}>
                  <span className={styles.link}>Browse Lisbon →</span>
                  <span className={styles.lead}>
                    Coordinated by <b>Marta Reis</b> &amp; <b>Catarina Vaz</b>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.cityCard}
              onClick={() => showToast('Porto opens publicly 12 Aug 2026', 'info')}
            >
              <div className={`${styles.cityImg} ${styles.cityImgB}`}>Porto · Ribeira at dawn</div>
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
                      <em>84</em>
                    </b>
                    Members
                  </span>
                  <span>
                    <b>12</b>Gatherings · in flight
                  </span>
                  <span>
                    <b>7</b>Safe spaces
                  </span>
                  <span>
                    <b>
                      <em>2</em>
                    </b>
                    Partners signed
                  </span>
                </div>
                <p className={styles.cityDek}>
                  Opening publicly <b>12 August 2026</b> after 18 months of quiet groundwork. Two
                  in-Porto moderators, partner relationship with Rede Ex Aequo, and a hosting
                  circle of nine members. The first public gathering is at Café Candelabro · 21
                  Aug.
                </p>
                <div className={styles.cityCta}>
                  <span className={styles.link}>Join the Porto beta →</span>
                  <span className={styles.lead}>
                    Coordinated by <b>Filipa Lopes</b>
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>

        <GroundworkSection />
        <WaitlistSection />
      </div>

      <HowSection />
    </PageShell>
  )
}
