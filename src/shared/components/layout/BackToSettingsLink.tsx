import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { routes } from '../../../app/routeMap'
import styles from './BackToSettingsLink.module.css'

/**
 * Shown only when a state screen is opened full-screen from the Settings
 * simulations gallery (the gallery appends `?from=sim`). Keeps these screens
 * from feeling like dead-ends. Renders nothing in the real product flow.
 */
export function BackToSettingsLink() {
  const [params] = useSearchParams()
  if (params.get('from') !== 'sim') return null
  return (
    <Link to={`${routes.settings}?pane=simulations`} className={styles.back}>
      <FiArrowLeft aria-hidden />
      Back to settings
    </Link>
  )
}
