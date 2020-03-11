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
      query {
        invitations {
          id
          from {
            id
          }
          group {
            id
          }
          link
          expiredAt
        }
      }
    }`;
    tester.test(true, query);
  });

  it('fail for non-existant field', () => {
    const query =  `{
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
      query {
        invitation(invitationId: "testID") {
          id
          from {
            id
          }
          group {
            id
          }
          link
          expiredAt
        }
      }
    }`;
    tester.test(true, query);
  });

  // MUTATIONS

  it('create invitation', () => {
    const mutation = `{
      mutation {
        createInvitation(input: {
          groupId: "ck73us7zr00670783zs910jna"
          link: "www.firebasetest.com"
          expiredAt: "today"
        }) {
          id
          from {
            name
            lastName
          }
          group {
            name
          }
          expiredAt
        }
      }
    }`;
    tester.test(true, mutation);
  });

  it('accept invitation', () => {
    const mutation = `{
      mutation {
        acceptInvitation(input: {
          invitationId: "ck6t39r0200iy07155ebg2gpb"
        }) {
          id
          join_at
        }
      }
    }`;
    tester.test(true, mutation);
  });
  
});