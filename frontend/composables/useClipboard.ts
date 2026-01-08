// composables/useClipboard.ts
/**
 * Clipboard composable for copying text to clipboard
 * Uses modern Clipboard API with execCommand fallback
 */

export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: Ref<boolean>;
  error: Ref<string | null>;
}

export function useClipboard(): UseClipboardReturn {
  const copied = ref(false)
  const error = ref<string | null>(null)

  /**
   * Copy text to clipboard using modern API or fallback
   */
  const copy = async (text: string): Promise<boolean> => {
    error.value = null

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        copied.value = true

        // Reset copied state after 2 seconds
        setTimeout(() => {
          copied.value = false
        }, 2000)

        return true
      }

      // Fallback to execCommand for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        textArea.remove()

        if (successful) {
          copied.value = true
          setTimeout(() => {
            copied.value = false
          }, 2000)
          return true
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        textArea.remove()
        throw err
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `Не удалось скопировать: ${errorMessage}`
      console.error('[useClipboard] Copy failed:', err)
      return false
    }
  }

  return {
    copy,
    copied,
    error
  }
}
