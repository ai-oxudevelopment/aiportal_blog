// frontend/cypress/e2e/main-page.cy.ts

describe('Main Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the main page before each test
    cy.visit('/');
  });

  describe('Page Loading', () => {
    it('should open the main page successfully', () => {
      // Verify page loads and contains expected elements
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-oid="rwsv1as"]').should('be.visible'); // Main container
      cy.get('[data-oid="o61u3sq"]').should('be.visible'); // Header
      cy.get('[data-oid="raq.yo:"]').should('be.visible'); // Main content
    });

    it('should display the header with brand and menu button', () => {
      cy.get('[data-oid="o61u3sq"]').should('be.visible');
      cy.contains('AIWORKPLACE BLOG').should('be.visible');
      cy.get('[data-oid="thtyyph"]').should('be.visible'); // Menu toggle button
    });
  });

  describe('Sidebar Menu', () => {
    it('should open the sidebar menu when menu button is clicked', () => {
      // Initially sidebar should be hidden
      cy.get('aside').should('have.class', '-translate-x-full');
      
      // Click menu toggle button
      cy.get('[data-oid="thtyyph"]').click();
      
      // Sidebar should be visible
      cy.get('aside').should('not.have.class', '-translate-x-full');
      cy.get('aside').should('have.class', 'translate-x-0');
    });

    it('should close the sidebar menu when menu button is clicked again', () => {
      // Open menu first
      cy.get('[data-oid="thtyyph"]').click();
      cy.get('aside').should('have.class', 'translate-x-0');
      
      // Close menu
      cy.get('[data-oid="thtyyph"]').click();
      cy.get('aside').should('have.class', '-translate-x-full');
    });

    it('should display navigation items in sidebar', () => {
      // Open sidebar
      cy.get('[data-oid="thtyyph"]').click();
      
      // Wait for sidebar to load (either from API or fallback)
      cy.get('aside nav').should('be.visible');
      
      // Check for navigation links (fallback sections if API fails)
      cy.get('aside nav a').should('have.length.at.least', 1);
      
      // Verify navigation items are present and have text content
      cy.get('aside nav a').each(($link) => {
        cy.wrap($link).should('be.visible');
        cy.wrap($link).should('not.be.empty');
      });
    });
  });

  describe('Hero Top Cards', () => {
    it('should display exactly 3 HeroTopCard components', () => {
      // Check that the hero section exists
      cy.get('[data-oid="lcz75dl"]').should('be.visible');
      
      // Verify exactly 3 hero cards are displayed
      cy.get('[data-oid="hero-top-card"]').should('have.length', 3);
    });

    it('should display correct card titles', () => {
      // Check each card has the expected titles
      cy.get('[data-oid="hero-top-card"]').eq(0).should('contain.text', 'gpt-oss-120b');
      cy.get('[data-oid="hero-top-card"]').eq(1).should('contain.text', 'gpt-oss-20b');
      cy.get('[data-oid="hero-top-card"]').eq(2).should('contain.text', 'gpt-oss-2b');
    });

    it('should display card descriptions', () => {
      // Check that each card has a description
      cy.get('[data-oid="card-description"]').should('have.length', 3);
      
      // Verify descriptions are not empty
      cy.get('[data-oid="card-description"]').each(($desc) => {
        cy.wrap($desc).should('not.be.empty');
      });
    });

    it('should display action buttons on cards', () => {
      // Check that each card has an action button
      cy.get('[data-oid="action-button"]').should('have.length', 3);
      
      // Verify button text
      cy.get('[data-oid="action-button"]').each(($button) => {
        cy.wrap($button).should('contain.text', 'Start building');
      });
    });

    it('should have hover effects on cards', () => {
      // Test hover effect on first card
      cy.get('[data-oid="hero-top-card"]').first().trigger('mouseover');
      
      // Check that button becomes visible on hover
      cy.get('[data-oid="button-container"]').first()
        .should('have.class', 'group-hover:translate-y-0')
        .should('have.class', 'group-hover:opacity-100');
    });
  });

  describe('Sidebar Navigation', () => {
    beforeEach(() => {
      // Open sidebar before each navigation test
      cy.get('[data-oid="thtyyph"]').click();
    });

    it('should redirect to agents page when clicking first menu item', () => {
      // Click on the first navigation link
      cy.get('aside nav a').first().click();
      
      // Should redirect to agents page
      cy.url().should('include', '/agents');
    });

    it('should redirect to mcp page when clicking second menu item', () => {
      // Click on the second navigation link
      cy.get('aside nav a').eq(1).click();
      
      // Should redirect to mcp page
      cy.url().should('include', '/mcp');
    });

    it('should redirect to prompts page when clicking third menu item', () => {
      // Click on the third navigation link
      cy.get('aside nav a').eq(2).click();
      
      // Should redirect to prompts page
      cy.url().should('include', '/prompts');
    });

    it('should redirect to soft page when clicking fourth menu item', () => {
      // Click on the fourth navigation link
      cy.get('aside nav a').eq(3).click();
      
      // Should redirect to soft page
      cy.url().should('include', '/soft');
    });

    it('should have working navigation links with proper href attributes', () => {
      // Check that all navigation links have proper href attributes
      cy.get('aside nav a').each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
        cy.wrap($link).invoke('attr', 'href').should('match', /^\/[a-z-]+$/);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Page should still load correctly
      cy.get('[data-oid="rwsv1as"]').should('be.visible');
      cy.get('[data-oid="hero-top-card"]').should('have.length', 3);
      
      // Menu button should be visible
      cy.get('[data-oid="thtyyph"]').should('be.visible');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport('ipad-2');
      
      // Page should still load correctly
      cy.get('[data-oid="rwsv1as"]').should('be.visible');
      cy.get('[data-oid="hero-top-card"]').should('have.length', 3);
    });

    it('should adapt to desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      // Page should still load correctly
      cy.get('[data-oid="rwsv1as"]').should('be.visible');
      cy.get('[data-oid="hero-top-card"]').should('have.length', 3);
    });
  });

  describe('Page Performance', () => {
    it('should load within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should have all critical elements visible', () => {
      // Check that all critical elements are visible
      cy.get('[data-oid="rwsv1as"]').should('be.visible');
      cy.get('[data-oid="o61u3sq"]').should('be.visible');
      cy.get('[data-oid="hero-top-card"]').should('have.length', 3);
      cy.get('[data-oid="thtyyph"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Check for proper button accessibility
      cy.get('[data-oid="thtyyph"]').should('have.attr', 'title', 'Toggle menu');
      
      // Check for proper link accessibility
      cy.get('aside nav a').each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });

    it('should be keyboard navigable', () => {
      // Test keyboard navigation by focusing on the menu button
      cy.get('[data-oid="thtyyph"]').focus();
      cy.get('[data-oid="thtyyph"]').should('have.focus');
      cy.get('[data-oid="thtyyph"]').should('be.visible');
    });
  });
});
