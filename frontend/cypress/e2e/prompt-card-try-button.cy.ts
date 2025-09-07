// frontend/cypress/e2e/prompt-card-try-button.cy.ts
describe('PromptCard Try Button', () => {
  const mockPrompt = {
    id: 1,
    attributes: {
      title: 'Test Prompt',
      slug: 'test-prompt',
      content: 'This is a test prompt for AI interaction',
      tags: {
        data: [
          {
            id: 1,
            attributes: {
              name: 'AI',
              slug: 'ai'
            }
          }
        ]
      },
      categories: {
        data: [
          {
            id: 1,
            attributes: {
              name: 'Test Category',
              slug: 'test-category'
            }
          }
        ]
      },
      publishedAt: '2024-01-01T00:00:00.000Z'
    }
  };

  beforeEach(() => {
    // Mock the component in a test environment
    cy.visit('/');
  });

  it('should display the Try button on hover', () => {
    // Since we're testing a component that might not be directly accessible,
    // we'll test the functionality through the page that uses it
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    
    // Check if the Try button appears
    cy.get('[title="Попробовать"]').should('be.visible');
  });

  it('should open AI dialog modal when Try button is clicked', () => {
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    cy.get('[title="Попробовать"]').click();
    
    // Check if the modal opens
    cy.get('h3').contains('Попробовать промпт').should('be.visible');
    cy.get('textarea[placeholder="Введите ваш запрос здесь..."]').should('be.visible');
  });

  it('should allow user to input query and send it', () => {
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    cy.get('[title="Попробовать"]').click();
    
    // Type in the textarea
    const testQuery = 'Test user query';
    cy.get('textarea[placeholder="Введите ваш запрос здесь..."]').type(testQuery);
    
    // Check that the send button is enabled
    cy.get('button').contains('Отправить запрос').should('not.be.disabled');
    
    // Click send
    cy.get('button').contains('Отправить запрос').click();
    
    // Check loading state
    cy.get('span').contains('AI генерирует ответ...').should('be.visible');
    
    // Wait for response (simulated delay)
    cy.wait(2000);
    
    // Check that response appears
    cy.get('h4').contains('Ответ AI:').should('be.visible');
  });

  it('should close modal when close button is clicked', () => {
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    cy.get('[title="Попробовать"]').click();
    
    // Verify modal is open
    cy.get('h3').contains('Попробовать промпт').should('be.visible');
    
    // Click close button
    cy.get('button').contains('Закрыть').click();
    
    // Verify modal is closed
    cy.get('h3').contains('Попробовать промпт').should('not.exist');
  });

  it('should display prompt content in the modal', () => {
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    cy.get('[title="Попробовать"]').click();
    
    // Check that prompt content is displayed
    cy.get('h4').contains('Промпт:').should('be.visible');
    cy.get('pre').should('contain', 'This is a test prompt for AI interaction');
  });

  it('should disable send button when input is empty', () => {
    cy.get('[data-testid="prompt-card"]').first().trigger('mouseover');
    cy.get('[title="Попробовать"]').click();
    
    // Check that send button is disabled when textarea is empty
    cy.get('button').contains('Отправить запрос').should('be.disabled');
    
    // Type something and check it becomes enabled
    cy.get('textarea[placeholder="Введите ваш запрос здесь..."]').type('test');
    cy.get('button').contains('Отправить запрос').should('not.be.disabled');
    
    // Clear input and check it becomes disabled again
    cy.get('textarea[placeholder="Введите ваш запрос здесь..."]').clear();
    cy.get('button').contains('Отправить запрос').should('be.disabled');
  });
});
