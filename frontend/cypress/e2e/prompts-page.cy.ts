// frontend/cypress/e2e/prompts-page.cy.ts
describe('Prompts Page', () => {
  beforeEach(() => {
    // Visit the prompts page before each test
    cy.visit('/prompts');
  });

  it('should load the prompts page without errors', () => {
    // Check that the page loads and doesn't show error states
    cy.get('[data-cy="error"]').should('not.exist');
    cy.get('[data-cy="loading"]').should('not.exist');
    
    // Check that the main content area exists
    cy.get('main').should('be.visible');
  });

  it('should display the prompts section title', () => {
    // Should show the section title from the backend
    cy.contains('Библиотека GPT-инструкций').should('be.visible');
  });

  it('should display prompt cards', () => {
    // Wait for articles to load
    cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
    
    // Should show prompt cards in the articles grid
    cy.get('article').should('have.length.greaterThan', 0);
    
    // Check that articles contain prompt-specific elements
    cy.get('article').first().within(() => {
      // Should have title
      cy.get('h3').should('be.visible');
      
      // Should have prompt-specific content (preview button, copy button, etc.)
      cy.get('button').contains('Предпросмотр').should('be.visible');
      cy.get('button[title*="copy"], button:contains("📋")').should('be.visible');
    });
  });

  it('should display categories and articles by category', () => {
    // Wait for content to load
    cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
    
    // Should show category sections
    cy.get('h3').contains(/Финансы|Документы|Разработка|Техподдержка|Коммуникация|Универсальные/).should('be.visible');
    
    // Each category should have articles
    cy.get('h3').contains(/Финансы|Документы/).parent().parent().within(() => {
      cy.get('article').should('have.length.greaterThan', 0);
    });
  });

  it('should allow interacting with prompt cards', () => {
    // Wait for content to load
    cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
    
    // Find the first prompt card and test preview functionality
    cy.get('article').first().within(() => {
      // Click preview button
      cy.get('button').contains('Предпросмотр').click();
    });
    
    // Should open preview modal
    cy.get('[role="dialog"], .fixed.inset-0').should('be.visible');
    cy.contains('Скопировать текст').should('be.visible');
    
    // Close modal
    cy.get('button').contains('×').click();
    cy.get('[role="dialog"], .fixed.inset-0').should('not.exist');
  });

  it('should display prompt usage counts and metadata', () => {
    // Wait for content to load
    cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
    
    cy.get('article').first().within(() => {
      // Should show usage count or publication date
      cy.get('time, span:contains("uses")').should('be.visible');
      
      // Should show category tags
      cy.get('span').contains(/Финансы|Документы|Разработка|Техподдержка|Коммуникация|Универсальные/).should('be.visible');
    });
  });

  it('should handle navigation and menu', () => {
    // Header should be visible
    cy.get('header').should('be.visible');
    
    // Sidebar should be accessible
    cy.get('[data-cy="sidebar"], nav').should('be.visible');
    
    // Should have breadcrumbs or navigation back to home
    cy.get('a[href="/"]').should('be.visible');
  });

  it('should be responsive', () => {
    // Test mobile view
    cy.viewport(375, 667);
    cy.get('main').should('be.visible');
    cy.get('article').should('be.visible');
    
    // Test tablet view
    cy.viewport(768, 1024);
    cy.get('main').should('be.visible');
    cy.get('article').should('be.visible');
    
    // Test desktop view
    cy.viewport(1200, 800);
    cy.get('main').should('be.visible');
    cy.get('article').should('be.visible');
  });

  it('should handle empty states gracefully', () => {
    // This test might not be applicable if prompts exist, but good to have
    // If no prompts exist, should show appropriate message
    cy.get('body').then(($body) => {
      if ($body.find('article').length === 0) {
        cy.contains('No Prompts Yet').should('be.visible');
      }
    });
  });
});
