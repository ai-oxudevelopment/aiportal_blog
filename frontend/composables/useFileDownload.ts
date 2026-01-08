import JSZip from 'jszip'

export function useFileDownload() {
  /**
   * Download content as a Markdown (.md) file
   */
  const downloadMarkdown = (filename: string, content: string) => {
    try {
      // Create a Blob with Markdown content
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = filename.endsWith('.md') ? filename : `${filename}.md`
      a.style.display = 'none'

      // Trigger download
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`[useFileDownload] Downloaded markdown: ${filename}`)
    } catch (error) {
      console.error('[useFileDownload] Failed to download markdown:', error)
      throw new Error('Не удалось скачать файл. Попробуйте еще раз.')
    }
  }

  /**
   * Download content as a ZIP archive
   */
  const downloadZip = async (filename: string, files: Record<string, string>) => {
    try {
      // Create a new ZIP archive
      const zip = new JSZip()

      // Add files to the ZIP
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content)
      })

      // Generate the ZIP file
      const blob = await zip.generateAsync({ type: 'blob' })

      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`
      a.style.display = 'none'

      // Trigger download
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`[useFileDownload] Downloaded ZIP: ${filename}`)
    } catch (error) {
      console.error('[useFileDownload] Failed to download ZIP:', error)
      throw new Error('Не удалось скачать ZIP-архив. Попробуйте еще раз.')
    }
  }

  /**
   * Download file from URL (e.g., Strapi file upload)
   */
  const downloadFileFromUrl = async (url: string, filename: string) => {
    try {
      console.log(`[useFileDownload] Downloading file from URL: ${url}`)

      // Fetch the file
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }

      // Create blob from response
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      a.style.display = 'none'

      // Trigger download
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)

      // Revoke URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)

      console.log(`[useFileDownload] Successfully downloaded: ${filename}`)
    } catch (error) {
      console.error(`[useFileDownload] Error downloading file from URL:`, error)
      throw new Error('Не удалось скачать файл. Попробуйте еще раз.')
    }
  }

  return {
    downloadMarkdown,
    downloadZip,
    downloadFileFromUrl
  }
}
