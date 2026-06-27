import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from './providers/AuthProvider'
import { I18nProvider } from './providers/I18nProvider'
import { ToastProvider } from '../shared/components/feedback/ToastProvider'
import { ConnectProvider } from './providers/ConnectProvider'
import { ProfileProvider } from './providers/ProfileProvider'
import { ProfileThemeProvider } from './providers/ProfileThemeProvider'
import { VouchProvider } from './providers/VouchProvider'
import { WorkProfileProvider } from './providers/WorkProfileProvider'
import { SavedProvider } from './providers/SavedProvider'
import { SocialProvider } from './providers/SocialProvider'
import { CommandPalette } from '../features/members/CommandPalette'
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
                <ProfileProvider>
                  <ProfileThemeProvider>
                    <ConnectProvider>
                      <VouchProvider>
                        <SavedProvider>
                          <SocialProvider>
                            <AppRoutes />
                            <CommandPalette />
                          </SocialProvider>
                        </SavedProvider>
                      </VouchProvider>
                    </ConnectProvider>
                  </ProfileThemeProvider>
                </ProfileProvider>
              </WorkProfileProvider>
              <RoomLoader />
            </BrowserRouter>
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
