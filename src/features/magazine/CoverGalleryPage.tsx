import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { FadeIn, HubBackLink, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import styles from "./CoverGalleryPage.module.css";

const ISSUE = routes.issue;
const MEMBER = routes.members;
const PRESS = routes.pressKit;

type Tint = "a" | "b" | "c" | "d" | "e";
interface Cover {
  tint: Tint;
  title: React.ReactNode;
  meta: string;
  number: string;
}
const COVERS: Cover[] = [
  {
    tint: "d",
    title: (
      <>
        On <em>health.</em>
      </>
    ),
    meta: "Spring · Jun 2026 · 84pp",
    number: "09",
  },
  {
    tint: "b",
    title: (
      <>
        On <em>work.</em>
      </>
    ),
    meta: "Winter · Mar 2026 · 72pp",
    number: "08",
  },
  {
    tint: "c",
    title: (
      <>
        On <em>inheritance.</em>
      </>
    ),
    meta: "Autumn · Dec 2025 · 68pp",
    number: "07",
  },
  {
    tint: "a",
    title: (
      <>
        On <em>the city.</em>
      </>
    ),
    meta: "Summer · Sep 2025 · 80pp",
    number: "06",
  },
  {
    tint: "e",
    title: (
      <>
        On <em>migration.</em>
      </>
    ),
    meta: "Spring · Jun 2025 · 76pp",
    number: "05",
  },
  {
    tint: "b",
    title: (
      <>
        On <em>the body.</em>
      </>
    ),
    meta: "Winter · Mar 2025 · 64pp",
    number: "04",
  },
  {
    tint: "c",
    title: (
      <>
        On <em>belonging.</em>
      </>
    ),
    meta: "Autumn · Dec 2024 · 60pp",
    number: "03",
  },
  {
    tint: "d",
    title: (
      <>
        On <em>time.</em>
      </>
    ),
    meta: "Summer · Sep 2024 · 56pp",
    number: "02",
  },
  {
    tint: "a",
    title: (
      <>
        On <em>beginning.</em>
      </>
    ),
    meta: "Inaugural · Jun 2024 · 48pp",
    number: "01",
  },
];
const TINT_CLASS: Record<Tint, string> = {
  a: "tintA",
  b: "tintB",
  c: "tintC",
  d: "tintD",
  e: "tintE",
};

const STATS = [
  { value: <em>9</em>, label: "Covers · one per quarter since launch" },
  { value: "8", label: "Different cover artists" },
  { value: <em>~620</em>, label: "Avg pages printed per issue" },
  { value: "Riso", label: "Printed at Editora Anjos · 3 colours max" },
];

const ILLUS: {
  initials: string;
  jade?: boolean;
  plum?: boolean;
  name: string;
  covers: React.ReactNode;
}[] = [
  {
    initials: "AB",
    name: "André Bento",
    covers: (
      <>
        Covers <b>09 · 05</b>
      </>
    ),
  },
  {
    initials: "TC",
    jade: true,
    name: "Tó Cunha",
    covers: (
      <>
        Covers <b>08 · 02</b>
      </>
    ),
  },
  {
    initials: "FL",
    name: "Filipa Lopes",
    covers: (
      <>
        Cover <b>07</b>
      </>
    ),
  },
  {
    initials: "MR",
    plum: true,
    name: "Marta Reis",
    covers: (
      <>
        Cover <b>06</b>
      </>
    ),
  },
  {
    initials: "SC",
    jade: true,
    name: "Sofia Castaño",
    covers: (
      <>
        Cover <b>05</b>
      </>
    ),
  },
  {
    initials: "AK",
    name: "Anika Kovač",
    covers: (
      <>
        Cover <b>04</b>
      </>
    ),
  },
  {
    initials: "CV",
    plum: true,
    name: "Catarina Vaz",
    covers: (
      <>
        Cover <b>03</b>
      </>
    ),
  },
  {
    initials: "8×",
    name: "Founders (group)",
    covers: (
      <>
        Cover <b>01</b> · inaugural
      </>
    ),
  },
];

function CoverTileSkeleton() {
  return (
    <div className={styles.tile} aria-hidden>
      <SkeletonLine
        height="auto"
        style={{ aspectRatio: "3 / 4", borderRadius: 14, marginBottom: 18 }}
      />
      <div className={styles.tileInfo}>
        <div className="left" style={{ flex: 1 }}>
          <SkeletonLine width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLine width="80%" height={12} />
        </div>
        <SkeletonLine width={32} height={14} />
      </div>
    </div>
  );
}

export function CoverGalleryPage() {
  const loading = useSimulatedLoad();
  const { t } = useTranslation();

  return (
    <PageShell>
      <MagazineMasthead active="covers" />
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <HubBackLink
              to={routes.magazine}
              label={t("magazine:coverGallery.backLink")}
              tone="light"
            />
            <div className={styles.eyebrow}>
              {t("magazine:coverGallery.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="magazine:coverGallery.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.dek}>
              <Translation
                i18nKey="magazine:coverGallery.dek"
                components={{ em: <em />, a: <Link to={PRESS} /> }}
              />
            </p>
          </div>
        </section>

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: COVERS.length }).map((_, i) => (
                <CoverTileSkeleton key={i} />
              ))
            : COVERS.map((cover, index) => (
                <FadeIn
                  as={Link}
                  to={ISSUE}
                  className={styles.tile}
                  key={cover.number}
                  delay={Math.min(index, 8) * 60}
                >
                  <div
                    className={`${styles.img} ${styles[TINT_CLASS[cover.tint]]}`}
                  >
                    <div className={styles.num}>
                      №<em>{cover.number}</em>
                    </div>
                  </div>
                  <div className={styles.tileInfo}>
                    <div className="left">
                      <b>{cover.title}</b>
                      <span>{cover.meta}</span>
                    </div>
                    <div className="right">
                      №<em>{cover.number}</em>
                    </div>
                  </div>
                </FadeIn>
              ))}
        </div>

        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {STATS.map((stat, index) => (
              <div className={styles.cgs} key={index}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.illus}>
          <h2>
            <Translation
              i18nKey="magazine:coverGallery.madeWithHeading"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("magazine:coverGallery.madeWithSub")}</p>
          <div className={styles.illusGrid}>
            {ILLUS.map((il) => (
              <Link to={MEMBER} className={styles.illusCard} key={il.name}>
                <div
                  className={[styles.illusAv, il.jade && styles.illusAvJade]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    il.plum
                      ? {
                          background: "rgba(45,27,61,.10)",
                          color: "var(--plum)",
                        }
                      : undefined
                  }
                >
                  {il.initials}
                </div>
                <div className={styles.illusName}>{il.name}</div>
                <div className={styles.illusMeta}>{il.covers}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
