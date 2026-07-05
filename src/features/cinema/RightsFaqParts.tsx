import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { FaqItem as FaqItemT, RightsSection } from "./cinemaRights.data";
import { contact } from "./cinemaRights.data";
import styles from "./CinemaRightsPage.module.css";

export function FaqItem({ item }: { item: FaqItemT }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ""}`}>
      <button
        type="button"
        className={styles.faqQ}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {item.q}
        <span className={styles.faqChevron}>
          <FiChevronDown aria-hidden />
        </span>
      </button>
      {open && <div className={styles.faqA}>{item.a}</div>}
    </div>
  );
}

export function FaqSection({ section }: { section: RightsSection }) {
  return (
    <section id={section.id} className={styles.faqSection}>
      <div className={styles.faqHead}>{section.title}</div>
      {section.items.map((item) => (
        <FaqItem key={item.q} item={item} />
      ))}
    </section>
  );
}

export function ContactBlock() {
  return (
    <section id={contact.id} className={styles.contactCard}>
      <div className={styles.contactTitle}>{contact.title}</div>
      <div className={styles.contactBody}>{contact.body}</div>
      <div className={styles.contactActions}>
        <Button to={routes.contact}>Contact the rights team</Button>
        <Button variant="ghost-dark" to={routes.cinemaSubmit}>
          Submit a film
        </Button>
      </div>
    </section>
  );
}
