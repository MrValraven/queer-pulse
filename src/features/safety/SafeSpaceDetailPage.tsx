import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useSafeSpace } from "./api/useSafeSpaces";
import { type Tint, type VerifiedSpace, type RemovedSpace } from "./safeSpaces";
import { VouchModal } from "./VouchModal";
import styles from "./SafeSpaceDetailPage.module.css";

const TINT: Record<Tint, string | undefined> = {
  coral: styles.tCoral,
  jade: styles.tJade,
  plum: styles.tPlum,
};
const SAFETY = routes.safety;
const VERIFIED_COUNT = 47;

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function emName(name: string) {
  const words = name.split(" ");
  const last = words.pop();
  return { lead: words.join(" "), last };
}

function VerifiedView({ s }: { s: VerifiedSpace }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [vouchOpen, setVouchOpen] = useState(false);
  const { lead, last } = emName(s.name);
  const share = () => {
    if (navigator.clipboard)
      navigator.clipboard.writeText(window.location.href);
    showToast(t("safety:spaces.detail.linkCopiedToast"), "success");
  };

  return (
    <div className={styles.page}>
      <Link to={routes.safeSpaces} className={styles.back}>
        {t("safety:spaces.detail.backLink")}
      </Link>

      <div className={styles.trustBanner}>
        <div className={styles.seal}>
          <Tick />
        </div>
        <div>
          <h3>
            {s.tier > 0
              ? t("safety:spaces.detail.trust.title", { tier: s.tier })
              : t("safety:spaces.detail.trust.titleNoTier")}
          </h3>
          <p>
            <Translation
              i18nKey="safety:spaces.detail.trust.body"
              values={{ date: s.reVerified, verifier: s.verifier }}
              components={{ strong: <strong /> }}
            />
          </p>
        </div>
      </div>

      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>{s.eyebrow}</div>
          <h1 className={styles.h1}>
            {lead && `${lead} `}
            <em>{last}.</em>
          </h1>
          <p className={styles.sub}>{s.sub}</p>
          <div className={styles.meta}>
            {s.metaPills.map((p) => (
              <span
                key={p.label}
                className={[styles.pill, p.accent && styles.pillAccent]
                  .filter(Boolean)
                  .join(" ")}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.heroImg}>{s.name}</div>
      </header>

      <div className={styles.grid}>
        <div>
          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.relyTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.secSub}>{t("safety:spaces.detail.relySub")}</p>
            <div className={styles.promises}>
              {s.promises.map((p) => (
                <div className={styles.promise} key={p.title}>
                  <div className={styles.check}>
                    <Tick />
                  </div>
                  <div>
                    <b>{p.title}</b>
                    <span>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.vouchedTitle"
                values={{ count: s.vouches.length }}
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.secSub}>
              {t("safety:spaces.detail.vouchedSub")}{" "}
              <Button
                variant="ghost"
                className={styles.vouchTrigger}
                onClick={() => setVouchOpen(true)}
              >
                {t("safety:spaces.detail.addVouchCta")}
              </Button>
            </p>
            <div className={styles.vouchRow}>
              {s.vouches.map((v) => (
                <div className={styles.vouch} key={v.name + v.when}>
                  <div className={styles.vouchHead}>
                    <div className={[styles.vouchAv, TINT[v.tint]].join(" ")}>
                      {v.initials}
                    </div>
                    <div>
                      <div className={styles.vouchName}>
                        <Link to={routes.members}>{v.name}</Link>
                      </div>
                      <div className={styles.vouchByline}>{v.byline}</div>
                    </div>
                  </div>
                  <div className={styles.vouchText}>{v.text}</div>
                  <div className={styles.vouchWhen}>{v.when}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.incidentTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.incident}>
              <h3>{t("safety:spaces.detail.dangerTitle")}</h3>
              <p>
                <Translation
                  i18nKey="safety:spaces.detail.dangerBody"
                  components={{ strong: <strong /> }}
                />
              </p>
              <Link to={SAFETY}>
                {t("safety:spaces.detail.emergencyGuideCta")}
              </Link>
            </div>
            <div className={[styles.incident, styles.incidentPlum].join(" ")}>
              <h3>{t("safety:spaces.detail.offTitle")}</h3>
              <p>{t("safety:spaces.detail.offBody")}</p>
              <Link to={SAFETY}>
                {t("safety:spaces.detail.quietReportCta")}
              </Link>
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <h4>{t("safety:spaces.detail.whereTitle")}</h4>
            <div className={styles.addr}>
              <b>{s.name}</b>
              {s.address}
            </div>
            <Button
              variant="ghost"
              className={styles.sideFull}
              to={routes.safeSpaces}
            >
              {t("safety:spaces.detail.backAllCta")}
            </Button>
          </div>

          <div className={styles.sideCard}>
            <h4>{t("safety:spaces.detail.glanceTitle")}</h4>
            {s.glance.map((g) => (
              <div className={styles.sideRow} key={g.label}>
                <span>{g.label}</span>
                <b className={g.accent ? styles.accentV : undefined}>
                  {g.value}
                </b>
              </div>
            ))}
          </div>

          <div className={[styles.sideCard, styles.sharePlum].join(" ")}>
            <h4>{t("safety:spaces.detail.shareTitle")}</h4>
            <p>{t("safety:spaces.detail.shareBody")}</p>
            <Button
              variant="ghost-dark"
              className={styles.sideFull}
              onClick={share}
            >
              {t("safety:spaces.detail.copyLinkCta")}
            </Button>
          </div>
        </aside>
      </div>

      {vouchOpen && (
        <VouchModal spaceName={s.name} onClose={() => setVouchOpen(false)} />
      )}
    </div>
  );
}

function RemovedView({ s }: { s: RemovedSpace }) {
  const { t } = useTranslation();
  const { lead, last } = emName(s.name);
  return (
    <div className={styles.page}>
      <Link to={routes.safeSpaces} className={styles.back}>
        {t("safety:spaces.detail.backLink")}
      </Link>

      <div className={styles.removedBanner}>
        <div className={styles.removedSeal}>
          <svg viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} />
            <line x1={8} y1={8} x2={16} y2={16} />
            <line x1={16} y1={8} x2={8} y2={16} />
          </svg>
        </div>
        <div className={styles.removedEyebrow}>
          {t("safety:spaces.detail.removedEyebrow", {
            type: s.typeLabel,
            hood: s.hood,
          })}
        </div>
        <h1 className={styles.removedTitle}>
          {lead && `${lead} `}
          <em>{last}.</em>
        </h1>
        <p className={styles.removedReason}>{s.reason}</p>
        <div className={styles.removedMetaRow}>
          <div className={styles.removedMeta}>
            <b>{s.removedDate}</b>
            {t("safety:spaces.detail.removedMeta.removed")}
          </div>
          <div className={styles.removedMeta}>
            <b>{s.listedSince}</b>
            {t("safety:spaces.detail.removedMeta.listedSince")}
          </div>
          <div className={styles.removedMeta}>
            <b>{s.flags}</b>
            {t("safety:spaces.detail.removedMeta.flags")}
          </div>
        </div>
      </div>

      <div className={styles.removedBody}>
        <div>
          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.whyRemovedTitle"
                components={{ em: <em /> }}
              />
            </h2>
            {s.reasonLong.map((p, i) => (
              <p className={styles.reasonP} key={i}>
                {p}
              </p>
            ))}
          </section>

          <section className={styles.sec}>
            <h2>
              <Translation
                i18nKey="safety:spaces.detail.howHappenedTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.secSub}>
              {t("safety:spaces.detail.howHappenedSub")}
            </p>
            <div className={styles.timeline}>
              {s.timeline.map((item, i) => (
                <div className={styles.tlItem} key={i}>
                  <div className={styles.tlDot} />
                  <div className={styles.tlDate}>{item.date}</div>
                  <div className={styles.tlEvent}>{item.event}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.whatNowCard}>
            <h3>{t("safety:spaces.detail.whatNowTitle")}</h3>
            <p>{s.whatNow}</p>
          </div>

          <div className={styles.sideCard}>
            <h4>{t("safety:spaces.detail.hadExperienceTitle")}</h4>
            <div
              className={styles.addr}
              style={{
                marginBottom: 12,
                fontSize: 13.5,
                color: "var(--ink-60)",
              }}
            >
              {t("safety:spaces.detail.hadExperienceBody")}
            </div>
            <Button variant="ghost" className={styles.sideFull} to={SAFETY}>
              {t("safety:spaces.detail.fileReportCta")}
            </Button>
          </div>

          <div className={[styles.sideCard, styles.sharePlum].join(" ")}>
            <h4>{t("safety:spaces.detail.lookingForTitle")}</h4>
            <p>
              {t("safety:spaces.detail.lookingForBody", {
                count: VERIFIED_COUNT,
              })}
            </p>
            <Button
              variant="ghost-dark"
              className={styles.sideFull}
              to={routes.safeSpaces}
            >
              {t("safety:spaces.detail.seeVerifiedCta")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function SafeSpaceDetailPage() {
  const { slug } = useParams();
  const { space, isLoading } = useSafeSpace(slug);

  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.page} aria-busy="true">
          <SkeletonLine width={120} height={14} />
          <SkeletonLine width="40%" height={30} style={{ marginTop: 16 }} />
          <SkeletonLine width="70%" height={16} style={{ marginTop: 16 }} />
          <SkeletonLine width="55%" height={16} style={{ marginTop: 10 }} />
        </div>
      </PageShell>
    );
  }

  if (!space) return <Navigate to={routes.safeSpaces} replace />;

  return (
    <PageShell>
      {space.kind === "verified" ? (
        <VerifiedView s={space.data} />
      ) : (
        <RemovedView s={space.data} />
      )}
    </PageShell>
  );
}
