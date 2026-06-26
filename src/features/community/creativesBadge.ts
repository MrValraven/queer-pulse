import styles from './CreativesPage.module.css'

export function badgeClass(b: string) {
  if (b.includes('commission') || b.includes('bookings')) return styles.cbCommission
  if (b.includes('exhibition') || b.includes('live')) return styles.cbExhibition
  return styles.cbCollab
}
