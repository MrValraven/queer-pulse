import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { StudioLine } from "./StudioSkeletons";
import { routes } from "../../app/routeMap";
import { buildFacts, MEMBERS } from "./studioCouncil.data";
import s from "./council.module.css";

/** Mirrors the council .cur card: avatar row + bio + note + footer. */
function CouncilCardSkeleton() {
  return (
    <div className={s.cur}>
      <div className={s.curHead}>
        <StudioLine
          width={54}
          height={54}
          style={{ borderRadius: "50%", flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <StudioLine width={70} height={11} />
          <StudioLine width="55%" height={20} style={{ marginTop: 8 }} />
          <StudioLine width="40%" height={11} style={{ marginTop: 8 }} />
        </div>
      </div>
      <StudioLine width="100%" height={13} style={{ marginTop: 16 }} />
      <StudioLine width="85%" height={13} style={{ marginTop: 8 }} />
      <StudioLine
        width="100%"
        height={64}
        style={{ marginTop: 16, borderRadius: 12 }}
      />
      <StudioLine width="60%" height={13} style={{ marginTop: 16 }} />
      <StudioLine width="100%" height={13} style={{ marginTop: 10 }} />
    </div>
  );
}

export function StudioCouncilPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const facts = useMemo(() => buildFacts(t), [t]);
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>{t("studio:council.hero.eyebrow")}</div>
          <h1>
            <Translation i18nKey="studio:council.hero.title" components={{ em: <em /> }} />
          </h1>
          <div className={s.dek}>
            <Translation i18nKey="studio:council.hero.dek" components={{ em: <em /> }} />
          </div>
        </div>

        <div className={s.intro}>
          <div className={s.lede}>
            <Translation i18nKey="studio:council.intro.lede" components={{ em: <em /> }} />
          </div>
          <div className={s.facts}>
            {facts.map((f, i) => (
              <div key={i} className={s.fact}>
                <div className={s.v}>{f.v}</div>
                <div className={s.l}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.curators}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CouncilCardSkeleton key={i} />
              ))
            : MEMBERS.map((mem, idx) => (
                <FadeIn
                  key={mem.em + mem.seat}
                  delay={Math.min(idx, 8) * 60}
                  className={s.cur}
                >
                  <div className={s.curHead}>
                    <div className={s.curAv}>
                      <ImageSlot
                        src={mem.image}
                        tint={mem.tint}
                        width={54}
                        height={54}
                        radius={9999}
                        shape="circle"
                        placeholder=""
                        initials={mem.pre[0]! + mem.em[0]!}
                      />
                    </div>
                    <div>
                      <div className={s.seat}>{mem.seat}</div>
                      <h3>
                        {mem.pre}
                        <em>{mem.em}</em>
                      </h3>
                      <div className={s.where}>
                        {mem.where.map((w, i) => (
                          <span
                            key={w}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            {i > 0 && <span className={s.dot} />}
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={s.curBio}>{mem.bio}</p>
                  <div className={s.curNote}>
                    <div className={s.nl}>
                      {t("studio:council.notebookLabel")} · {mem.noteDate}
                    </div>
                    <p>{mem.note}</p>
                  </div>
                  <div>
                    <div className={s.slLbl}>
                      {t("studio:council.recentSlatesLabel")} · {mem.slatesCount}
                    </div>
                    {mem.slates.map((sl) => (
                      <div key={sl.pre} className={s.slRow}>
                        <div className={s.st}>
                          {sl.pre}
                          {sl.em && <em>{sl.em}</em>}
                          {sl.post}
                        </div>
                        <div className={s.sd}>{sl.date}</div>
                        <div className={s.sp}>{sl.out}</div>
                      </div>
                    ))}
                  </div>
                  <div className={s.curFoot}>
                    <div className={s.curStat}>{mem.stat}</div>
                    <Link to={routes.studioAlbum} className={s.bt}>
                      {t("studio:council.theirSlateCta")} →
                    </Link>
                  </div>
                </FadeIn>
              ))}
        </div>
      </div>
    </StudioShell>
  );
}
