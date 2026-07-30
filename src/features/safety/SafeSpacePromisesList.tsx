import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Promise as SafeSpacePromise } from "./safeSpaces";
import { SafeSpaceTickIcon } from "./SafeSpaceTickIcon";
import styles from "./SafeSpaceDetailPage.module.css";

/**
 * "What you can rely on here" — the promises list from a verified safe
 * space's detail. Extracted out of `SafeSpaceDetailPage`'s `VerifiedView` so
 * both the safe-spaces hub's own detail page and the directory detail page's
 * inline trust section (`DirectorySpaceTrust`) render the identical list.
 */
export function SafeSpacePromisesList({
  promises,
}: {
  promises: SafeSpacePromise[];
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="safety:spaces.detail.relyTitle"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.secSub}>{t("safety:spaces.detail.relySub")}</p>
      <div className={styles.promises}>
        {promises.map((promise) => (
          <div className={styles.promise} key={promise.title}>
            <div className={styles.check}>
              <SafeSpaceTickIcon />
            </div>
            <div>
              <b>{promise.title}</b>
              <span>{promise.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
