import { useEffect, useRef, type MouseEvent } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { focusFieldById } from "./studioUploadFocus";
import css from "./StudioUploadPublish.module.css";

export interface UploadErrorSummaryItem {
  /** The id of the field that fixes it; the link focuses that field. */
  fieldId: string;
  messageKey: string;
}

/**
 * The refused-Continue summary: an alert that names every problem, each a
 * link to its field. Each refusal (`focusRequest` going up) moves focus to
 * the first invalid field, so phone and screen-reader members both learn the
 * press failed and where to go.
 */
export function StudioUploadErrorSummary({
  items,
  focusRequest,
}: {
  items: UploadErrorSummaryItem[];
  focusRequest: number;
}) {
  const { t } = useTranslation();
  const lastHandledRef = useRef(focusRequest);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstFieldId = items[0]?.fieldId;
  // The refusal brings the summary itself on screen with the field under
  // it, so a Continue pressed at the foot of the form shows what to fix.
  useEffect(() => {
    if (focusRequest === lastHandledRef.current) return;
    lastHandledRef.current = focusRequest;
    if (firstFieldId)
      focusFieldById(firstFieldId, {
        wrap: wrapRef.current,
        content: contentRef.current,
      });
  }, [focusRequest, firstFieldId]);

  const followLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (focusFieldById(id)) event.preventDefault();
  };

  return (
    <div role="alert" ref={wrapRef} className={css.errorSummaryWrap}>
      <Collapse isOpen={items.length > 0}>
        <div ref={contentRef} className={css.errorSummary}>
          <p className={css.errorSummaryLead}>
            {t("studio:uploadFlow.errorSummary.lead", { count: items.length })}
          </p>
          <ul>
            {items.map((item) => (
              <li key={item.fieldId}>
                <a
                  href={`#${item.fieldId}`}
                  onClick={(event) => followLink(event, item.fieldId)}
                >
                  {t(item.messageKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
