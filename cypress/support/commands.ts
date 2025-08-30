// cypress/support/commands.ts
// Add custom commands for accessibility testing

Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('checkA11yWithConfig', (config: any) => {
  cy.injectAxe();
  cy.checkA11y(null, config);
});

Cypress.Commands.add('checkA11yForElement', (selector: string, config?: any) => {
  cy.injectAxe();
  cy.checkA11y(selector, config);
});

// Custom command to test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', (selector: string) => {
  cy.get(selector).first().focus();
  cy.get(selector).first().should('have.focus');
  
  cy.get(selector).each(($el) => {
    cy.wrap($el).should('be.visible');
    cy.wrap($el).tab();
  });
});

// Custom command to test focus management
Cypress.Commands.add('testFocusManagement', (selector: string) => {
  cy.get(selector).first().focus();
  cy.get(selector).first().should('have.focus');
  
  cy.get(selector).each(($el) => {
    cy.wrap($el).focus();
    cy.wrap($el).should('have.focus');
  });
});

// Custom command to test ARIA attributes
Cypress.Commands.add('testAriaAttributes', (selector: string, expectedRole?: string) => {
  cy.get(selector).each(($el) => {
    if (expectedRole) {
      cy.wrap($el).should('have.attr', 'role', expectedRole);
    }
    cy.wrap($el).should('have.text');
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      checkA11y(): Chainable<void>;
      checkA11yWithConfig(config: any): Chainable<void>;
      checkA11yForElement(selector: string, config?: any): Chainable<void>;
      testKeyboardNavigation(selector: string): Chainable<void>;
      testFocusManagement(selector: string): Chainable<void>;
      testAriaAttributes(selector: string, expectedRole?: string): Chainable<void>;
    }
  }
}
