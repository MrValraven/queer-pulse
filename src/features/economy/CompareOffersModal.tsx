import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
import type { Application } from "./applicationStatus.types";
import { COMPARE_ROWS } from "./compareOffers.data";
import styles from "./CompareOffersModal.module.css";

/** Side-by-side comparison of every live offer: salary, start, holiday, terms. */
export function CompareOffersModal({
  offers,
  onClose,
  onRespond,
}: {
  offers: Application[];
  onClose: () => void;
  onRespond: (appId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalShell onClose={onClose} wide>
      <div className={styles.eyebrow}>{t("economy:compare.eyebrow")}</div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:compare.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:compare.sub")}</p>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label -- empty top-left corner cell of the comparison grid; a layout spacer <th>, not an interactive control. */}
              <th className={styles.rowHead} />
              {offers.map((a) => (
                <th key={a.id} className={styles.colHead}>
                  <span className={styles.colCo}>{a.companyName}</span>
                  <span className={styles.colRole}>{a.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.labelKey}>
                <th className={styles.rowHead}>{t(row.labelKey)}</th>
                {offers.map((offer) => (
                  <td key={offer.id} className={styles.cell}>
                    {row.get(offer, t)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className={styles.rowHead}>
                {t("economy:compare.whatsIncluded")}
              </th>
              {offers.map((a) => (
                <td key={a.id} className={styles.cell}>
                  <ul className={styles.terms}>
                    {a.offer?.terms.map((term) => (
                      <li key={term}>
                        <FiCheck
                          className={styles.tick}
                          size={14}
                          aria-hidden
                        />{" "}
                        {term}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label -- empty spacer cell above the respond buttons; a layout <th>, not an interactive control. */}
              <th className={styles.rowHead} />
              {offers.map((a) => (
                <td key={a.id} className={styles.cell}>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => onRespond(a.id)}
                  >
                    {t("economy:compare.respondCta")}{" "}
                    <FiArrowRight aria-hidden />
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          <FiArrowLeft aria-hidden />{" "}
          {t("economy:compare.close")}
        </button>
      </div>
    </ModalShell>
  );
}
