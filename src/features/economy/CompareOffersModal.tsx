import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell } from "./ModalKit";
import type { Application } from "./applicationStatus.data";
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
  return (
    <ModalShell onClose={onClose} wide>
      <div className={styles.eyebrow}>Your offers</div>
      <h2 className={styles.title}>
        Two offers, <em>side by side.</em>
      </h2>
      <p className={styles.sub}>
        A calm view of what's on the table. Compare the numbers, then respond
        when you're ready.
      </p>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
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
              <tr key={row.label}>
                <th className={styles.rowHead}>{row.label}</th>
                {offers.map((a) => (
                  <td key={a.id} className={styles.cell}>
                    {row.get(a)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className={styles.rowHead}>What's included</th>
              {offers.map((a) => (
                <td key={a.id} className={styles.cell}>
                  <ul className={styles.terms}>
                    {a.offer?.terms.map((t) => (
                      <li key={t}>
                        <FiCheck
                          className={styles.tick}
                          size={14}
                          aria-hidden
                        />{" "}
                        {t}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <th className={styles.rowHead} />
              {offers.map((a) => (
                <td key={a.id} className={styles.cell}>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => onRespond(a.id)}
                  >
                    Respond →
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          ← Close
        </button>
      </div>
    </ModalShell>
  );
}
