import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { I18nProvider } from './providers/I18nProvider'
import { ToastProvider } from '../shared/components/feedback/ToastProvider'
import { ScrollManager } from './ScrollManager'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollManager />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
