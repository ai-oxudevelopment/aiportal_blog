/**
 * PWA Event Handler Plugin
 *
 * Handles service worker lifecycle events:
 * - swInstalled: Fired when service worker is first installed
 * - swUpdated: Fired when new service worker version is available
 * - swReady: Fired when service worker is activated
 *
 * This plugin provides user-friendly prompts for service worker updates
 * and helps with debugging during development.
 */

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Service worker installed event
    window.addEventListener('swInstalled', (event: any) => {
      console.log('[PWA] Service Worker installed:', event.detail)

      // In production, you might want to show a notification
      if (process.env.NODE_ENV === 'production') {
        // Optional: Show a subtle notification that the app is ready for offline use
        console.log('[PWA] App is ready for offline use')
      }
    })

    // Service worker updated event - new version available
    window.addEventListener('swUpdated', (event: any) => {
      console.log('[PWA] New content available:', event.detail)

      // In production, prompt user to refresh
      if (process.env.NODE_ENV === 'production') {
        // Automatically refresh after navigation, or prompt user
        const reload = confirm(
          'Новая версия доступна. Обновить для получения последних улучшений?\n' +
          'New version available. Refresh for latest improvements?'
        )

        if (reload) {
          window.location.reload()
        }
      }
    })

    // Service worker ready event
    window.addEventListener('swReady', () => {
      console.log('[PWA] Service Worker is active and ready')
    })

    // Service worker activation
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      console.log('[PWA] Service Worker controller changed - page refreshed')
    })

    // Log if service worker is not supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported in this browser')
    }
  }
})
