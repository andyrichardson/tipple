Cypress.on('window:before:load', win => {
  delete win.fetch;
});

context('Initial load', () => {
  before(() => {
    cy.visit('/');
  });

  describe('posts', () => {
    it('loads first post', () => {
      cy.get('[data-testid="post"]')
        .eq(0)
        .contains('Tipple is the best!');
    });

    it('loads second post', () => {
      cy.get('[data-testid="post"]')
        .eq(1)
        .contains('Unpopular opinion - Tipple edition.');
    });
  });

  describe('comments', () => {
    it('counts first post comments', () => {
      cy.get('[data-testid="replies-count"]')
        .eq(0)
        .contains('2 replies');
    });

    it('counts second post comments', () => {
      cy.get('[data-testid="replies-count"]')
        .eq(1)
        .contains('0 replies');
    });
  });
});

context('Refetch', () => {
  before(() => {
    cy.server();
    cy.route('**/posts').as('getPosts');
    cy.visit('/');
  });

  describe('on button click', () => {
    it('triggers API call', () => {
      cy.get('[data-testid="refetch"]').click();
      cy.wait('@getPosts');
    });
  });
});

context('Push', () => {
  before(() => {
    cy.server();
    cy.route({ url: '**/posts', method: 'GET' }).as('getPosts');
    cy.route({ url: '**/posts', method: 'POST' }).as('addPost');
    cy.visit('/');
    cy.wait('@getPosts');
  });

  describe('on add post', () => {
    it('triggers API call and causes refetch of domain', () => {
      cy.get('input').type('Hello world');
      cy.get('button')
        .eq(0)
        .click();
      cy.wait('@addPost');
      cy.wait('@getPosts');
      cy.get('[data-testid="post"]').should('have.length', 3);
      cy.get('[data-testid="post"]')
        .eq(2)
        .contains('Hello world');
    });
  });
});
