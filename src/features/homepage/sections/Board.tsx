import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath, routes } from '../../../app/routeMap'
import { boardFilters, boardPosts } from '../data/boardPosts'
import { filterBoardPosts } from '../lib/filters'
import styles from './Board.module.css'

type BoardFilter = (typeof boardFilters)[number]['value']

export function Board() {
  const [filter, setFilter] = useState<BoardFilter>('all')
  const visible = filterBoardPosts(boardPosts, filter)

  return (
    <section className={styles.board} id="board">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <>
                Asks &amp; <em>offers</em>
              </>
            }
            subtitle="The community noticeboard. What the room needs this week — and what it's giving back. No job titles required."
          />
        </Reveal>

        <Reveal className={styles.bar}>
          <div className={styles.chips}>
            {boardFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[styles.chip, filter === option.value && styles.chipActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            to={routes.offer}
            style={{ fontSize: 13, padding: '9px 17px' }}
          >
            + Post something
          </Button>
        </Reveal>

        <div className={styles.grid}>
          {visible.map((post) => (
            <Link key={post.href} to={linkToPath(post.href)} className={styles.ask}>
              <span className={[styles.kind, styles[post.kind]].join(' ')}>
                {post.kind === 'looking' ? 'Looking for' : 'Offering'}
              </span>
              <h3 className={styles.title}>{post.title}</h3>
              <div className={styles.poster}>
                <span className={styles.avMini}>{post.posterInitials}</span>
                <div className={styles.who}>
                  <b>{post.posterName}</b> · <span>{post.posterMeta}</span>
                </div>
                <span className={styles.age}>{post.age}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
