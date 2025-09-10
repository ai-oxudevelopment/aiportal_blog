describe('Prompts Page E2E Tests', () => {
  it('should load the prompts page, receive data from Strapi, and display PromptCard components', () => {
    // Intercept the API call to Strapi sections endpoint
    cy.intercept('GET', '/api/sections*').as('getSections')

    // Visit the prompts page
    cy.visit('/prompts')

    // Check that the page loads (verify main heading contains expected text)
    cy.contains('h1', 'Библиотека GPT-инструкций').should('be.visible')

    // Wait for the API call to complete
    cy.wait('@getSections').then((interception) => {
      // Verify the API call was made
      expect(interception.request.url).to.include('/api/sections')
      expect(interception.request.query).to.have.property('publicationState', 'live')

      // Verify the response contains data
      const response = interception.response?.body
      expect(response).to.have.property('data')
      expect(response.data).to.be.an('array').and.have.length.greaterThan(0)

      // Log the response for debugging
      cy.log('API Response:', JSON.stringify(response, null, 2))

      // Find the prompts section - this should exist for the test to pass
      const promptsSection = response.data.find((section: any) =>
        section.attributes?.slug === 'prompts' ||
        section.attributes?.name?.toLowerCase() === 'prompts'
      )

      // Assert that prompts section exists
      expect(promptsSection).to.exist
      cy.log('Found prompts section:', promptsSection.attributes.name)

      // Verify the section has articles
      expect(promptsSection.attributes).to.have.property('articles')
      expect(promptsSection.attributes.articles.data).to.be.an('array').and.have.length.greaterThan(0)

      // Check that there are articles with type 'prompt'
      const promptArticles = promptsSection.attributes.articles.data.filter((article: any) =>
        article.attributes?.type === 'prompt'
      )

      // Assert that at least one article has type 'prompt'
      expect(promptArticles).to.have.length.greaterThan(0)
      cy.log(`Found ${promptArticles.length} articles with type 'prompt'`)

      // Verify each prompt article has required fields
      promptArticles.forEach((article: any) => {
        expect(article.attributes).to.have.property('title')
        expect(article.attributes).to.have.property('content')
        expect(article.attributes).to.have.property('type', 'prompt')
      })
    })

    // Check that PromptCard components are displayed on the page
    // Scope the search to the prompts section for more reliable selection
    cy.get('#prompts-section').within(() => {
      // Look for PromptCard containers with the specific class pattern
      cy.get('.group.relative.bg-zinc-900\\/90').should('have.length.greaterThan', 0)

      // Verify that the cards contain expected content
      cy.get('.group.relative.bg-zinc-900\\/90').first().within(() => {
        // Check that title is present
        cy.get('h3').should('exist').and('not.be.empty')

        // Check that content/description is present
        cy.get('p').should('exist')
      })
    })
  })
})