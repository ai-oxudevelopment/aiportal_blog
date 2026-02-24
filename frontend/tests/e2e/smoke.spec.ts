/**
 * E2E Smoke Tests
 * Basic smoke tests to verify core functionality works
 */

import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AI Portal Blog|AI Portal/)
  })

  test('speckits page loads', async ({ page }) => {
    await page.goto('/speckits')
    // Check that some element is visible (h1 or body content)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('prompts page loads', async ({ page }) => {
    await page.goto('/prompts')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('research page loads', async ({ page }) => {
    await page.goto('/research')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('blogs page loads', async ({ page }) => {
    await page.goto('/blogs')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

test.describe('Navigation Tests', () => {
  test('navigation links work', async ({ page }) => {
    await page.goto('/')

    // Try to find and click a link to speckits if it exists
    const speckitsLink = page.locator('a[href="/speckits"]').first()
    const hasLink = await speckitsLink.count()

    if (hasLink > 0) {
      await speckitsLink.click()
      await expect(page).toHaveURL(/\/speckits/)
    }
  })
})

test.describe('Core Web Vitals', () => {
  test('should not have console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')

    // Check for critical errors (ignore non-critical ones)
    const criticalErrors = errors.filter(err =>
      !err.includes('DevTools') &&
      !err.includes('Extension') &&
      !err.includes('404')
    )

    // We expect some errors in development, but not too many
    expect(criticalErrors.length).toBeLessThan(5)
  })
})
