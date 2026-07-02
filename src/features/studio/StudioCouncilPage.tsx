import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { StudioLine } from "./StudioSkeletons";
import { routes } from "../../app/routeMap";
import { FACTS, MEMBERS } from "./studioCouncil.data";
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
  const loading = useSimulatedLoad();
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>Governance · the council</div>
          <h1>
            Six people decide what the room <em>hears</em>.
          </h1>
          <div className={s.dek}>
            Elected yearly by the assembly, paid a flat stipend on the public
            ledger, term-limited to two years. They program the weekly set, run
            triage, and write the notes.{" "}
            <em>Everything they pick has their name on it.</em>
          </div>
        </div>

        <div className={s.intro}>
          <div className={s.lede}>
            The council isn't a tastemaker board behind glass. They listen in
            the open, <em>justify every pick in a paragraph</em>, and answer for
            the rate. You can read their notebooks, see their slates, and vote
            them out.
          </div>
          <div className={s.facts}>
            {FACTS.map((f, i) => (
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
                      From the notebook · {mem.noteDate}
                    </div>
                    <p>{mem.note}</p>
                  </div>
                  <div>
                    <div className={s.slLbl}>
                      Recent slates · {mem.slatesCount}
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
                      Their slate →
                    </Link>
                  </div>
                </FadeIn>
              ))}
        </div>
      </div>
    </StudioShell>
  );
}
