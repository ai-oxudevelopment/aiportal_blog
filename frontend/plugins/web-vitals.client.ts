import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  const sendToAnalytics = (metric: any) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
      })
    }

    // Send to analytics endpoint (optional - implement if needed)
    // $fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   body: {
    //     name: metric.name,
    //     value: metric.value,
    //     id: metric.id,
    //     delta: metric.delta,
    //     navigationType: metric.navigationType,
    //     url: window.location.href
    //   }
    // })
  }

  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
})
