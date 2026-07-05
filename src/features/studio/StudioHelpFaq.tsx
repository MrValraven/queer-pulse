import { useState } from "react";
import type { FaqItem } from "./studioHelp.data";
import s from "./StudioHelpPage.module.css";

/**
 * Single-open FAQ accordion: opening one question closes the rest.
 * Each question is a real <button> so it's keyboard-operable, and the answer
 * is aria-linked to it and animated open via a max-height transition.
 */
export function StudioHelpFaq({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={s.faq}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className={s.faqItem}>
            <button
              type="button"
              className={s.faqQ}
              aria-expanded={open}
              aria-controls={`faq-a-${item.id}`}
              id={`faq-q-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span>{item.q}</span>
              <span className={`${s.faqIcon} ${open ? s.faqIconOpen : ""}`}>
                +
              </span>
            </button>
            <div
              id={`faq-a-${item.id}`}
              role="region"
              aria-labelledby={`faq-q-${item.id}`}
              className={`${s.faqA} ${open ? s.faqAOpen : ""}`}
              hidden={!open}
            >
              <div className={s.faqAInner}>{item.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
