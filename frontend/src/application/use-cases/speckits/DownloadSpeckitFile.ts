// DownloadSpeckitFile Use Case
// Use case for downloading a speckit file

import type { IArticlesRepository } from '@/domain/repositories'

export interface DownloadSpeckitFileRequest {
  speckitSlug: string
}

export interface DownloadSpeckitFileResponse {
  blob: Blob
  filename: string
  mimeType: string
}

export class DownloadSpeckitFile {
  constructor(
    private articlesRepo: IArticlesRepository
  ) {}

  async execute(request: DownloadSpeckitFileRequest): Promise<DownloadSpeckitFileResponse> {
    // Get speckit
    const speckit = await this.articlesRepo.findBySlug(request.speckitSlug)

    if (!speckit) {
      throw new Error('Speckit not found')
    }

    if (!speckit.file) {
      throw new Error('Speckit has no file attachment')
    }

    // Download file
    const response = await fetch(speckit.file.url)

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const blob = await response.blob()

    return {
      blob,
      filename: speckit.file.name,
      mimeType: speckit.file.mimeType
    }
  }
}
