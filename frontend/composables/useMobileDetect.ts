/**
 * Mobile Detection Composable
 *
 * Uses Vuetify's useDisplay() for breakpoint detection
 * Provides mobile-specific viewport and device information
 */

import { useDisplay } from 'vuetify'

export const useMobileDetect = () => {
  const display = useDisplay()

  // Mobile breakpoint detection (screens < 600px)
  const mobile = computed(() => display.mobile.value)
  const smAndDown = computed(() => display.smAndDown.value) // < 960px
  const mdAndDown = computed(() => display.mdAndDown.value) // < 1280px

  // Tablet detection (600px - 960px)
  const tablet = computed(() => display.sm && !display.xs)

  // Desktop detection (> 960px)
  const desktop = computed(() => display.lgAndUp.value)

  // Viewport dimensions
  const width = computed(() => display.width.value)
  const height = computed(() => display.height.value)

  // Viewport name
  const breakpoint = computed(() => display.name.value)

  // Touch device detection
  const isTouch = computed(() => {
    if (import.meta.client) {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    return false
  })

  // Specific device types
  const isMobilePhone = computed(() => {
    return display.xs.value // < 600px
  })

  const isTablet = computed(() => {
    return display.sm.value || display.md.value // 600px - 1280px
  })

  const isDesktop = computed(() => {
    return display.lg.value || display.xl.value // > 1280px
  })

  // Orientation detection
  const orientation = computed(() => {
    if (import.meta.client) {
      return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    }
    return 'portrait'
  })

  const isLandscape = computed(() => orientation.value === 'landscape')
  const isPortrait = computed(() => orientation.value === 'portrait')

  // Small device detection (iPhone SE, etc.)
  const isSmallDevice = computed(() => width.value < 375)

  // Large mobile device detection (iPhone Pro Max, etc.)
  const isLargeMobile = computed(() => width.value >= 375 && width.value < 600)

  // Safe area support (notched devices)
  const hasSafeAreas = computed(() => {
    if (import.meta.client) {
      return CSS.supports('padding', 'env(safe-area-inset-top)')
    }
    return false
  })

  return {
    // Breakpoint booleans
    mobile,
    tablet,
    desktop,
    smAndDown,
    mdAndDown,

    // Device type
    isMobilePhone,
    isTablet,
    isDesktop,
    isTouch,

    // Size-specific
    isSmallDevice,
    isLargeMobile,

    // Orientation
    orientation,
    isLandscape,
    isPortrait,

    // Viewport info
    width,
    height,
    breakpoint,

    // Safe areas
    hasSafeAreas,

    // Vuetify display object (for advanced usage)
    display
  }
}
