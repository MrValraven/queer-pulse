import { useMemo } from "react";
import { Link } from "react-router-dom";
import { parseGuideBody, type GuideInline } from "./guideBody.model";
import styles from "./GuidePage.module.css";

/** One line's text and in-app links. The text is never read as HTML. */
function GuideInlines({ inlines }: { inlines: GuideInline[] }) {
  return (
    <>
      {inlines.map((inline, index) =>
        inline.kind === "link" ? (
          <Link key={index} to={inline.path} className={styles.bodyLink}>
            {inline.label}
          </Link>
        ) : (
          <span key={index}>{inline.text}</span>
        ),
      )}
    </>
  );
}

/**
 * A guide section's text as paragraphs and lists (contract 8.2): a blank
 * line ends a block, `- ` lines make a list, and `[label](/path)` is a
 * link inside QueerPulse, followed through the router.
 */
export function GuideBodyText({ body }: { body: string }) {
  const blocks = useMemo(() => parseGuideBody(body), [body]);
  if (blocks.length === 0) return null;
  return (
    <div className={styles.bodyText}>
      {blocks.map((block, blockIndex) =>
        block.kind === "paragraph" ? (
          <p key={blockIndex}>
            <GuideInlines inlines={block.inlines} />
          </p>
        ) : (
          <ul key={blockIndex}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <GuideInlines inlines={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
