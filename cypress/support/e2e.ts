// cypress/support/e2e.ts
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for accessibility testing
declare global {
  namespace Cypress {
    interface Chainable {
      wickA11y(): Chainable<void>;
    }
  }
}

// Import cypress-axe for accessibility testing
import 'cypress-axe';
