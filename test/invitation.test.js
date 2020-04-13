const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('Invitation', () => {
  let tester;

  before(() => {
    tester = new EasyGraphQLTester(schema);
  });

  // QUERIES

  it('fetch all invitations', () => {
    const query = `{
      invitations {
        id
        code
        group {
          id
        }
        role {
          id
          type
        }
        createdAt
      }    
    }`;
    tester.test(true, query);
  });

  it('fetch all invitations for group', () => {
    const query = `{
      invitationsForGroup(groupId: "ck8jkdqo800z60721henu34da") {
        id
        code
        role {
          id
          type
        }
        createdAt
      }
    }`;
    tester.test(true, query);
  });

  it('fail for non-existant field', () => {
    const query = `{
      query {
        invitations {
          id
          FALSEFIELD
        }
      }
    }`;
    tester.test(false, query);
  });

  it('fetch single invitation', () => {
    const query = `{
      invitation(invitationId: "ck8jkdqpv00zi0721l112gien") {
        id
        code
        role {
          id
          type
        }
        createdAt
      }
    }`;
    tester.test(true, query);
  });

  // MUTATIONS

  it('create invitation', () => {
    const mutation = `
      mutation CreateInvitation {
        createInvitation(input:{
          groupId: "ck8jkdqo800z60721henu34da"
          role: "tenant"
        }) {
          id
          code
          role {
            id
            type
          }
          createdAt
        }
      }`;
    tester.test(true, mutation);
  });

  it('refresh invitation', () => {
    const mutation = `
      mutation RefreshInvitation {
        refreshInvitation(input: {
          invitationId: "ck8jkdqpv00zi0721l112gien"
          groupId: "ck8jkdqo800z60721henu34da"
        }) {
          id
          code
        }
      }`;
    tester.test(true, mutation);
  });
});
