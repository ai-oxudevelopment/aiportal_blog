import { onMounted } from 'vue'

/**
 * usePerformanceMetrics Composable
 *
 * Tracks performance metrics for SSR mode including Time to Interactive (TTI),
 * hydration duration, click response times, and navigation timing. Provides utility
 * functions for measuring and logging performance data to diagnose hydration delays.
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { measureTTI, measureClickTime, logMetrics } = usePerformanceMetrics()
 *
 * onMounted(() => {
 *   measureTTI()
 * })
 * </script>
 * ```
 */

export interface HydrationMetrics {
  htmlRenderTime: number
  appMountTime: number
  firstInteractiveTime: number
  allInteractiveTime: number
  hydrationDuration: number
  clickResponseTime: number
}

/**
 * Measure Time to Interactive (TTI)
 * In SSR mode, this includes server HTML render + client hydration
 */
export function measureTTI(): number {
  const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const appMount = performance.now()
  const tti = appMount - navStart.startTime

  // Calculate hydration duration
  const htmlRenderTime = navStart?.responseStart || 0
  const hydrationDuration = tti - htmlRenderTime

  console.log('📊 TTI Measurement:', tti.toFixed(0), 'ms')
  console.log('  - HTML Render:', htmlRenderTime.toFixed(0), 'ms')
  console.log('  - Hydration:', hydrationDuration.toFixed(0), 'ms')

  // Success criteria check
  if (tti < 2000) {
    console.log('✅ TTI within target (< 2000ms)')
  } else if (tti < 5000) {
    console.warn('⚠️ TTI acceptable but exceeds target:', tti.toFixed(0), 'ms')
  } else {
    console.error('❌ CRITICAL: TTI exceeds 5 seconds - user experiencing delay')
    console.error('❌ Investigating hydration delay...')
  }

  return tti
}

/**
 * Measure click response time
 * Call this before and after a click handler to measure responsiveness
 */
export function measureClickTime(clickStart: number): number {
  const clickEnd = performance.now()
  const responseTime = clickEnd - clickStart

  console.log('🖱️ Click Response Time:', responseTime.toFixed(0), 'ms')

  // Success criteria check
  if (responseTime < 100) {
    console.log('✅ Excellent click response (< 100ms)')
  } else if (responseTime < 500) {
    console.log('✅ Click response within target (< 500ms)')
  } else if (responseTime < 1000) {
    console.warn('⚠️ Click response slow but acceptable:', responseTime.toFixed(0), 'ms')
  } else {
    console.error('❌ CRITICAL: Click response exceeds 1 second')
  }

  return responseTime
}

/**
 * Get comprehensive hydration metrics for SSR mode
 * In SSR mode, hydrationDuration is the time from HTML render to interactive
 */
export function measureHydrationMetrics(): HydrationMetrics {
  const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const appMount = performance.now()

  const htmlRenderTime = navStart?.responseStart || 0
  const hydrationDuration = appMount - htmlRenderTime

  return {
    htmlRenderTime,
    appMountTime: appMount,
    firstInteractiveTime: appMount,
    allInteractiveTime: appMount,
    hydrationDuration,
    clickResponseTime: 0 // To be measured on click
  }
}

/**
 * Log all performance metrics
 * Call this to get a comprehensive performance report
 */
export function logMetrics(metrics: HydrationMetrics): void {
  console.log('='.repeat(50))
  console.log('📊 COMPREHENSIVE SSR PERFORMANCE METRICS')
  console.log('='.repeat(50))
  console.log('HTML Render Time:', metrics.htmlRenderTime.toFixed(0), 'ms (Server)')
  console.log('App Mount Time:', metrics.appMountTime.toFixed(0), 'ms (Client)')
  console.log('First Interactive Time:', metrics.firstInteractiveTime.toFixed(0), 'ms')
  console.log('All Interactive Time:', metrics.allInteractiveTime.toFixed(0), 'ms')
  console.log('Hydration Duration:', metrics.hydrationDuration.toFixed(0), 'ms ⚠️ KEY METRIC')
  console.log('Click Response Time:', metrics.clickResponseTime, 'ms (to be measured)')
  console.log('='.repeat(50))

  // Overall assessment
  const tti = metrics.firstInteractiveTime
  const hydration = metrics.hydrationDuration

  if (tti < 2000 && hydration < 1000) {
    console.log('✅ EXCELLENT: Fast TTI with minimal hydration delay')
  } else if (tti < 5000) {
    console.log('⚠️ ACCEPTABLE: TTI within reasonable range')
    if (hydration > 3000) {
      console.warn('⚠️ WARNING: Hydration delay > 3 seconds - needs optimization')
    }
  } else {
    console.log('❌ POOR: TTI exceeds 5 seconds - optimization critical')
    console.error('❌ Primary issue: Hydration duration =', hydration.toFixed(0), 'ms')
  }
  console.log('='.repeat(50))
}

/**
 * Main composable function
 * Sets up performance tracking on mount
 */
export function usePerformanceMetrics() {
  let clickStartTime: number | null = null

  onMounted(() => {
    performance.mark('app-mounted')
    console.log('✅ SSR Performance tracking initialized')
  })

  return {
    measureTTI,
    measureClickTime,
    measureHydrationMetrics,
    logMetrics,

    // Utility: Start timing a click
    startClickTimer: () => {
      clickStartTime = performance.now()
      return clickStartTime
    },

    // Utility: End timing a click and log result
    endClickTimer: () => {
      if (clickStartTime === null) {
        console.warn('⚠️ Click timer not started')
        return 0
      }
      return measureClickTime(clickStartTime)
    },

    // Utility: Get current timestamp
    now: () => performance.now(),

    // Utility: Check if running in SSR mode
    isSSRMode: () => {
      const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      // In SSR mode, responseStart will be > 0 (server HTML delivered)
      return navStart?.responseStart > 0 && navStart?.transferSize > 0
    },

    // Utility: Get hydration duration specifically
    getHydrationDuration: () => {
      const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const appMount = performance.now()
      const htmlRenderTime = navStart?.responseStart || 0
      return appMount - htmlRenderTime
    }
  }
}
