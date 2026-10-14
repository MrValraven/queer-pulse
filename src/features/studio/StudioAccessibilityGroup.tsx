import { FiCheckCircle, FiClock, FiMinusCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessGroup, ItemStatus } from "./studioAccessibility.data";
import s from "./StudioAccessibilityPage.module.css";

export function StatusPill({ status }: { status: ItemStatus }) {
  const { t } = useTranslation();
  if (status === "soon") {
    return (
      <span className={`${s.st} ${s.soon}`}>
        <FiClock aria-hidden />
        {t("studio:accessibility.status.inProgress")}
      </span>
    );
  }
  if (status === "notYet") {
    return (
      <span className={`${s.st} ${s.notYet}`}>
        <FiMinusCircle aria-hidden />
        {t("studio:accessibilityLive.status.notYet")}
      </span>
    );
  }
  return (
    <span className={`${s.st} ${s.live}`}>
      <FiCheckCircle aria-hidden />
      {t("studio:accessibilityLive.status.live")}
    </span>
  );
}

/** One group of items, each with its status. Items are h3 under the
 *  group's h2. */
export function AccessGroupSection({ group }: { group: AccessGroup }) {
  return (
    <section className={s.sec}>
      <h2>{group.heading}</h2>
      <div className={s.dek}>{group.dek}</div>
      <div className={s.list}>
        {group.items.map((item, itemIndex) => (
          <div key={itemIndex} className={s.item}>
            <div className={s.ic} aria-hidden>
              {item.icon}
            </div>
            <div className={s.ai}>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
            </div>
            <StatusPill status={item.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
