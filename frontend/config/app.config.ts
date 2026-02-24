// Application-level configuration
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean
}

export const appDefaults: Partial<AppConfig> = {
  name: 'AI Portal Blog',
  version: '1.0.0',
  environment: 'development',
  debug: true,
}
