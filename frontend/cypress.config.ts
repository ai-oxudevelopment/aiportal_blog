// cypress.config.ts
import { defineConfig } from 'cypress';
import { tasks } from './cypress/support/tasks';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/work-progress-tests/**/*.cy.{js,jsx,ts,tsx}'
    ],
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Register custom tasks for Task 1 verification
      Object.entries(tasks).forEach(([taskName, taskFunction]) => {
        on('task', {
          [taskName]: taskFunction
        });
      });
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
