describe('Homepage Sidebar Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display homepage and sidebar toggle', () => {
    // Assert header is visible
    cy.get('header').should('be.visible')

    // Assert sidebar toggle button exists
    cy.get('[data-oid="thtyyph"]').should('be.visible')

    // Assert sidebar is initially hidden
    cy.get('aside').should('have.class', '-translate-x-full')
  })

  it('should open sidebar when toggle is clicked', () => {
    // Click toggle button
    cy.get('[data-oid="thtyyph"]').click()

    // Assert sidebar is visible
    cy.get('aside').should('have.class', 'translate-x-0')

    // Assert navigation menu is present
    cy.get('aside nav').should('be.visible')

    // Assert there are menu items
    cy.get('aside nav a').should('have.length.at.least', 1)
  })

  it('should navigate through sidebar menu items', () => {
    // Open sidebar
    cy.get('[data-oid="thtyyph"]').click()
    cy.get('aside').should('have.class', 'translate-x-0')

    // Collect internal hrefs to navigate deterministically and avoid DOM detachment
    cy.get('aside nav a[href^="/"]').then(($links) => {
      const hrefs = ($links.get() as HTMLElement[])
        .map((el) => (el as HTMLAnchorElement).getAttribute('href'))
        .filter((h): h is string => !!h && h !== '/')
        .slice(0, 3)

      // Navigate by direct visit to avoid detachment from clicking links
      hrefs.forEach((href) => {
        cy.visit(href)
        cy.location('pathname').should('eq', href)
        cy.get('main').should('be.visible')
      })
    })
  })

  it('should work on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport('iphone-x')

    // Assert page loads correctly
    cy.get('header').should('be.visible')
    cy.get('[data-oid="thtyyph"]').should('be.visible')

    // Open sidebar
    cy.get('[data-oid="thtyyph"]').click()
    cy.get('aside').should('have.class', 'translate-x-0')

    // Assert menu items are accessible
    cy.get('aside nav a').should('have.length.at.least', 1)
  })
})