import { plugin, defaultConfig } from '@formkit/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(plugin, defaultConfig({
    theme: 'genesis',
    config: {
      classes: {
        // Global wrapper classes - minimal, let CSS handle styling
        global: {
          outer: 'formkit-outer',
          wrapper: 'formkit-wrapper',
          label: 'formkit-label',
          help: 'formkit-help',
          messages: 'formkit-messages',
          message: 'formkit-message',
          inner: 'formkit-inner',
          input: 'formkit-input',
          prefixIcon: 'formkit-prefix-icon',
          suffixIcon: 'formkit-suffix-icon'
        },
        
        // Text input specific
        text: {
          input: 'formkit-input'
        },
        
        // Email input specific
        email: {
          input: 'formkit-input'
        },
        
        // Password input specific
        password: {
          input: 'formkit-input'
        },
        
        // Number input specific
        number: {
          input: 'formkit-input'
        },
        
        // Textarea specific
        textarea: {
          input: 'formkit-input formkit-textarea'
        },
        
        // Select specific
        select: {
          input: 'formkit-input',
          option: 'formkit-option'
        },
        
        // Checkbox specific
        checkbox: {
          wrapper: 'formkit-wrapper',
          inner: 'formkit-inner',
          input: 'formkit-input',
          label: 'formkit-label'
        },
        
        // Radio specific
        radio: {
          wrapper: 'formkit-wrapper',
          inner: 'formkit-inner',
          input: 'formkit-input',
          label: 'formkit-label'
        },
        
        // File input specific
        file: {
          input: 'formkit-input',
          noFiles: 'formkit-no-files',
          fileItem: 'formkit-file-item',
          fileName: 'formkit-file-name',
          fileRemove: 'formkit-file-remove'
        },
        
        // Range/slider specific
        range: {
          input: 'formkit-input'
        },
        
        // Submit button (if using FormKit submit)
        submit: {
          input: 'formkit-input btn-iridescent-primary px-6 py-3 rounded-lg font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
        }
      }
    }
  }))
})