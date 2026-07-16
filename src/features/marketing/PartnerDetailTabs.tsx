import type { Partner, Tint } from "./partnerDetails";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./PartnerDetailPage.module.css";

export type PartnerTab = "about" | "work" | "timeline" | "how";

export function PartnerTabBar({
  p,
  tab,
  setTab,
}: {
  p: Partner;
  tab: PartnerTab;
  setTab: (t: PartnerTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.tabs}>
      <button
        type="button"
        className={[s.tab, tab === "about" && s.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setTab("about")}
      >
        {t("marketing:partnerDetail.tab.about")}
      </button>
      <button
        type="button"
        className={[s.tab, tab === "work" && s.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setTab("work")}
      >
        {t("marketing:partnerDetail.tab.work")}{" "}
        <span className={s.tabCount}>{p.jointWork.length}</span>
      </button>
      <button
        type="button"
        className={[s.tab, tab === "timeline" && s.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setTab("timeline")}
      >
        {t("marketing:partnerDetail.tab.timeline")}
      </button>
      <button
        type="button"
        className={[s.tab, tab === "how" && s.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setTab("how")}
      >
        {t("marketing:partnerDetail.tab.how")}
      </button>
    </div>
  );
}

const TL_CLASS: Record<Tint, string> = {
  coral: "",
  jade: s.tlJade!,
  plum: s.tlPlum!,
};

export function PartnerAboutTab({ p }: { p: Partner }) {
  return (
    <>
      <div className={s.prose}>
        {p.about.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className={s.stats}>
        {p.stats.map((st, i) => (
          <div className={s.stat} key={i}>
            <b>{st.value}</b>
            {st.label}
          </div>
        ))}
      </div>
      <div className={s.prose}>
        {p.aboutMore.map((sec) => (
          <div key={sec.heading}>
            <h3>{sec.heading}</h3>
            <p>{sec.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function PartnerWorkTab({ p }: { p: Partner }) {
  return (
    <div className={s.collabGrid}>
      {p.jointWork.map((c) => (
        <div className={s.collab} key={c.title}>
          <div className={s.collabKicker}>{c.kicker}</div>
          <div className={s.collabTitle}>{c.title}</div>
          <div className={s.collabDek}>{c.dek}</div>
          <div className={s.collabFoot}>
            <span>{c.footLeft}</span>
            <b>{c.footRight}</b>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PartnerTimelineTab({ p }: { p: Partner }) {
  return (
    <div className={s.timeline}>
      {p.timeline.map((t, i) => (
        <div
          className={[s.tlItem, t.tint && TL_CLASS[t.tint]]
            .filter(Boolean)
            .join(" ")}
          key={i}
        >
          <div className={s.tlDate}>{t.date}</div>
          <div className={s.tlTitle}>{t.title}</div>
          <div className={s.tlBody}>{t.body}</div>
        </div>
      ))}
    </div>
  );
}

export function PartnerHowTab({ p }: { p: Partner }) {
  return (
    <>
      <div className={s.prose}>
        {p.how.map((sec) => (
          <div key={sec.heading}>
            <h3>{sec.heading}</h3>
            <p>{sec.body}</p>
          </div>
        ))}
      </div>
      <div className={s.fundNote}>{p.funding}</div>
    </>
  );
}
