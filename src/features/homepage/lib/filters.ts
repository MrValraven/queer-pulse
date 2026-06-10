import type { BoardPost, MapSpace, MapSpaceType, Member } from '../data/types'

/** Members matching a category, or all when `category === 'all'`. */
export function filterMembers(
  list: Member[],
  category: 'all' | Member['category'],
): Member[] {
  return category === 'all'
    ? list
    : list.filter((member) => member.category === category)
}

/** Board posts matching either a kind or a category filter. */
export function filterBoardPosts(
  list: BoardPost[],
  filter: 'all' | BoardPost['kind'] | BoardPost['category'],
): BoardPost[] {
  if (filter === 'all') return list
  return list.filter(
    (post) => post.kind === filter || post.category === filter,
  )
}

/** Map spaces visible under the active type filter. */
export function visibleSpaces(
  list: MapSpace[],
  type: 'all' | MapSpaceType,
): MapSpace[] {
  return type === 'all' ? list : list.filter((space) => space.type === type)
}
