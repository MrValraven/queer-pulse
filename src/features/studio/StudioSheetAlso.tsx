import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import ss from "./studio.module.css";
import { ALSO, SHEET_TRANSCRIBER } from "./studioSheetStore.data";

const TRANSCRIBER_SHEET_COUNT = 84;
const TRANSCRIBER_SHARE = 0.55;

export function StudioSheetAlso() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();

  return (
    <section className={ss.row}>
      <div className={ss.rowH}>
        <h2>
          <Translation
            i18nKey="studio:sheet.also.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={ss.sub}>
          {t("studio:sheet.also.subtitle", {
            count: TRANSCRIBER_SHEET_COUNT,
            name: SHEET_TRANSCRIBER,
            amount: fmt.currency(TRANSCRIBER_SHARE),
          })}
        </div>
      </div>
      {loading ? (
        <StudioCardGridSkeleton className={ss.rowGrid} count={ALSO.length} />
      ) : (
        <div className={ss.rowGrid}>
          {ALSO.map((a, i) => (
            <FadeIn
              key={a.pre}
              delay={Math.min(i, 8) * 60}
              as={Link}
              to={routes.studioSheetStore}
              className={ss.card}
            >
              <div className={ss.cardCov} style={{ aspectRatio: "0.77" }}>
                <ImageSlot
                  src={a.image}
                  tint={a.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder={t("studio:media.scoreLabel")}
                  style={{ position: "absolute", inset: 0 }}
                />
                <span
                  className={`${ss.tag} ${a.price == null ? ss.tagFree : ss.tagMem}`}
                >
                  {a.price == null
                    ? t("studio:sheet.also.freeReadTag")
                    : fmt.currency(a.price)}
                </span>
              </div>
              <h4>
                {a.pre}
                <em>{a.em}</em>
              </h4>
              <div className={ss.meta}>{a.who}</div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
