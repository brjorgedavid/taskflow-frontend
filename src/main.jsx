import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import store from './store'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </Provider>
)
