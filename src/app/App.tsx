import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from './providers/AuthProvider'
import { I18nProvider } from './providers/I18nProvider'
import { ToastProvider } from '../shared/components/feedback/ToastProvider'
import { ConnectProvider } from './providers/ConnectProvider'
import { WorkProfileProvider } from './providers/WorkProfileProvider'
import { RoomLoader } from '../shared/components/feedback/RoomLoader'
import { ScrollManager } from './ScrollManager'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>
            <BrowserRouter>
              <ScrollManager />
              <WorkProfileProvider>
                <ConnectProvider>
                  <AppRoutes />
                </ConnectProvider>
              </WorkProfileProvider>
              <RoomLoader />
            </BrowserRouter>
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
