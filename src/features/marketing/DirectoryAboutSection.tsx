import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Dash = () => (
  <svg viewBox="0 0 24 24">
    <line x1={5} y1={12} x2={19} y2={12} />
  </svg>
);

/**
 * "What it is" and "What this place offers": the owner's description of the
 * business, and the amenity list they set at submission.
 *
 * Third in the main column, under the hours and the practical block: by the
 * time a member is reading prose they have already established that the place
 * is open and reachable. Extracted out of `DirectorySpaceMain` so that
 * component is a plain running order and nothing else.
 */
export function DirectoryAboutSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const hasWhatItIs = place.whatItIs.length > 0;
  const hasGoodFor = place.goodFor.length > 0;

  return (
    <>
      {hasWhatItIs && (
        <section className={s.sec}>
          <h2>
            <Translation
              i18nKey="marketing:directory.detail.whatItIsTitle"
              components={{ em: <em /> }}
            />
          </h2>
          {place.whatItIs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      )}

      {hasGoodFor && (
        <section className={s.sec}>
          {/* Owner-attributed at every review count. These tags are set once
              by the owner at submission and no review ever touches them, so a
              "what members say" heading would claim a consensus that does not
              exist. The sub-line underneath names the owner for the same
              reason (see goodForSub). */}
          <h2>
            <Translation
              i18nKey="marketing:directory.detail.offersTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={s.subLine}>
            {t("marketing:directory.detail.goodForSub", {
              name: place.owner.first,
            })}
          </p>
          <div className={s.features}>
            {place.goodFor.map((feature) => (
              <div
                key={feature.label}
                className={[s.feature, !feature.yes && s.featureMaybe]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={s.featureIc}>
                  {feature.yes ? <Check /> : <Dash />}
                </div>
                {feature.label}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
