import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SafeSpacePromiseInput,
  SafeSpaceVouchInput,
} from "./api/adminSafeSpaces.api";
import { emptyPromise, emptyVouch } from "./adminSafeSpaceModal.utils";
import styles from "./AdminSafeSpaceModal.module.css";

/**
 * Repeatable "promises" list (title + short description) shown on the
 * public safe-space profile. Index-keyed, mirroring the row add/remove
 * convention in `SocialLinksEditor`/`LinksSection` — rows have no identity
 * worth preserving across reorders, only their position in the list.
 */
export function AdminSafeSpacePromiseFields({
  promises,
  onChange,
}: {
  promises: SafeSpacePromiseInput[];
  onChange: (promises: SafeSpacePromiseInput[]) => void;
}) {
  const { t } = useTranslation();

  function updatePromise(index: number, patch: Partial<SafeSpacePromiseInput>) {
    onChange(
      promises.map((promise, promiseIndex) =>
        promiseIndex === index ? { ...promise, ...patch } : promise,
      ),
    );
  }

  function removePromise(index: number) {
    onChange(promises.filter((_, promiseIndex) => promiseIndex !== index));
  }

  return (
    <div className={styles.repeatSection}>
      <label className={styles.fieldLabel}>
        {t("admin:adminSafeSpaces.modal.promisesLabel")}
      </label>
      {promises.map((promise, index) => (
        <div key={index} className={styles.repeatRow}>
          <input
            className={styles.textInput}
            aria-label={t(
              "admin:adminSafeSpaces.modal.promiseTitlePlaceholder",
            )}
            placeholder={t(
              "admin:adminSafeSpaces.modal.promiseTitlePlaceholder",
            )}
            value={promise.title}
            onChange={(event) =>
              updatePromise(index, { title: event.target.value })
            }
          />
          <input
            className={styles.textInput}
            aria-label={t("admin:adminSafeSpaces.modal.promiseDescPlaceholder")}
            placeholder={t(
              "admin:adminSafeSpaces.modal.promiseDescPlaceholder",
            )}
            value={promise.desc}
            onChange={(event) =>
              updatePromise(index, { desc: event.target.value })
            }
          />
          <button
            type="button"
            className={styles.rowRemove}
            aria-label={t("admin:adminSafeSpaces.modal.removeRowAriaLabel")}
            onClick={() => removePromise(index)}
          >
            <FiX size={15} />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="md"
        onClick={() => onChange([...promises, emptyPromise()])}
      >
        {t("admin:adminSafeSpaces.modal.addPromiseCta")}
      </Button>
    </div>
  );
}

/**
 * Repeatable "vouches" list (a member's short testimonial) shown on the
 * public safe-space profile. Same index-keyed convention as the promises
 * list above.
 */
export function AdminSafeSpaceVouchFields({
  vouches,
  onChange,
}: {
  vouches: SafeSpaceVouchInput[];
  onChange: (vouches: SafeSpaceVouchInput[]) => void;
}) {
  const { t } = useTranslation();

  function updateVouch(index: number, patch: Partial<SafeSpaceVouchInput>) {
    onChange(
      vouches.map((vouch, vouchIndex) =>
        vouchIndex === index ? { ...vouch, ...patch } : vouch,
      ),
    );
  }

  function removeVouch(index: number) {
    onChange(vouches.filter((_, vouchIndex) => vouchIndex !== index));
  }

  return (
    <div className={styles.repeatSection}>
      <label className={styles.fieldLabel}>
        {t("admin:adminSafeSpaces.modal.vouchesLabel")}
      </label>
      {vouches.map((vouch, index) => (
        <div key={index} className={styles.repeatRow}>
          <input
            className={styles.textInput}
            aria-label={t("admin:adminSafeSpaces.modal.vouchNamePlaceholder")}
            placeholder={t("admin:adminSafeSpaces.modal.vouchNamePlaceholder")}
            value={vouch.name}
            onChange={(event) =>
              updateVouch(index, { name: event.target.value })
            }
          />
          <input
            className={styles.textInput}
            aria-label={t("admin:adminSafeSpaces.modal.vouchBylinePlaceholder")}
            placeholder={t(
              "admin:adminSafeSpaces.modal.vouchBylinePlaceholder",
            )}
            value={vouch.byline}
            onChange={(event) =>
              updateVouch(index, { byline: event.target.value })
            }
          />
          <textarea
            className={styles.textarea}
            rows={2}
            aria-label={t("admin:adminSafeSpaces.modal.vouchTextPlaceholder")}
            placeholder={t("admin:adminSafeSpaces.modal.vouchTextPlaceholder")}
            value={vouch.text}
            onChange={(event) =>
              updateVouch(index, { text: event.target.value })
            }
          />
          <input
            className={styles.textInput}
            aria-label={t("admin:adminSafeSpaces.modal.vouchWhenPlaceholder")}
            placeholder={t("admin:adminSafeSpaces.modal.vouchWhenPlaceholder")}
            value={vouch.when}
            onChange={(event) =>
              updateVouch(index, { when: event.target.value })
            }
          />
          <button
            type="button"
            className={styles.rowRemove}
            aria-label={t("admin:adminSafeSpaces.modal.removeRowAriaLabel")}
            onClick={() => removeVouch(index)}
          >
            <FiX size={15} />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="md"
        onClick={() => onChange([...vouches, emptyVouch()])}
      >
        {t("admin:adminSafeSpaces.modal.addVouchCta")}
      </Button>
    </div>
  );
}
