/**
 * PWA Install Prompt Composable
 *
 * Handles PWA installation prompts for Android (native) and iOS (custom instructions)
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export const usePwaInstall = () => {
  const deferredPrompt = ref<any>(null)
  const showInstallPrompt = ref(false)
  const isIOS = ref(false)

  // Detect iOS device
  const detectIOS = () => {
    if (import.meta.client) {
      const ua = navigator.userAgent
      isIOS.value = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream

      // Show custom install prompt for iOS if not already installed
      if (isIOS.value) {
        const isInstalled = (window as any).navigator.standalone === true
        const isInMode = window.matchMedia('(display-mode: standalone)').matches

        if (!isInstalled && !isInMode) {
          // Check if user has dismissed the prompt
          const dismissed = localStorage.getItem('pwa-ios-prompt-dismissed')
          if (!dismissed) {
            showInstallPrompt.value = true
          }
        }
      }
    }
  }

  // Handle beforeinstallprompt event (Android/Chrome)
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('pwa-android-prompt-dismissed')
    if (!dismissed) {
      showInstallPrompt.value = true
    }
  }

  // Handle appinstalled event
  const handleAppInstalled = () => {
    deferredPrompt.value = null
    showInstallPrompt.value = false
    localStorage.removeItem('pwa-android-prompt-dismissed')
  }

  // Install the PWA (Android/Chrome only)
  const install = async () => {
    if (!deferredPrompt.value) {
      console.warn('Install prompt not available')
      return
    }

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      deferredPrompt.value = null
      showInstallPrompt.value = false
      localStorage.removeItem('pwa-android-prompt-dismissed')
    } else {
      // User dismissed, save preference
      localStorage.setItem('pwa-android-prompt-dismissed', 'true')
    }
  }

  // Dismiss the install prompt
  const dismiss = () => {
    showInstallPrompt.value = false

    // Save dismissal preference
    if (isIOS.value) {
      localStorage.setItem('pwa-ios-prompt-dismissed', 'true')
    } else {
      localStorage.setItem('pwa-android-prompt-dismissed', 'true')
    }
  }

  // Reset dismissed state (for testing)
  const resetDismissed = () => {
    localStorage.removeItem('pwa-ios-prompt-dismissed')
    localStorage.removeItem('pwa-android-prompt-dismissed')
    showInstallPrompt.value = true
  }

  // Check if PWA is already running in standalone mode
  const isStandalone = computed(() => {
    if (import.meta.client) {
      return (window as any).navigator.standalone === true ||
             window.matchMedia('(display-mode: standalone)').matches
    }
    return false
  })

  // Get iOS install instructions
  const iosInstructions = [
    'Нажмите кнопку "Поделиться" внизу экрана',
    'Прокрутите вниз и нажмите "На экран «Домой»"',
    'Нажмите "Добавить" в правом верхнем углу'
  ]

  onMounted(() => {
    detectIOS()

    if (import.meta.client) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  })

  return {
    showInstallPrompt,
    isIOS,
    isStandalone,
    install,
    dismiss,
    resetDismissed,
    iosInstructions
  }
}
