import type { ReactNode, Ref } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import shelfStyles from "./kit/StudioShelf.module.css";
import styles from "./StudioMeSectionHead.module.css";

interface StudioMeSectionHeadProps {
  /** The heading's id; the section and its list are labelled by it. */
  id: string;
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
  /** Lets the page move focus to the link, for example after a resume. */
  seeAllRef?: Ref<HTMLAnchorElement>;
  /** A quiet note under the title, such as the range a list covers. The
   * See all link stays level with the title. */
  children?: ReactNode;
}

/**
 * The head every section on the "You" page shares. It reuses the Studio
 * shelf's own classes, so the serif title, the pill-shaped See all with its
 * chevron and the 44px target match the shelves above and below it. The
 * link is described by the heading, as the shelf's is.
 */
export function StudioMeSectionHead({
  id,
  title,
  seeAllHref,
  seeAllLabel,
  seeAllRef,
  children,
}: StudioMeSectionHeadProps) {
  return (
    <header
      className={
        children
          ? `${shelfStyles.head} ${styles.headWithNote}`
          : shelfStyles.head
      }
    >
      <div className={shelfStyles.headText}>
        <h2 id={id} className={shelfStyles.title}>
          {title}
        </h2>
        {children}
      </div>
      <Link
        ref={seeAllRef}
        to={seeAllHref}
        className={shelfStyles.seeAll}
        aria-describedby={id}
      >
        {seeAllLabel}
        <FiChevronRight aria-hidden />
      </Link>
    </header>
  );
}
