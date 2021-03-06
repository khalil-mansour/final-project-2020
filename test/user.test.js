
const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('User', () => {
  let tester;

  before(() => {
    tester = new EasyGraphQLTester(schema);
  });

  it('all field exist', () => {
    const query = `{
      users  {
        id,
        firebaseId,
        name,
        lastName,
        email,
        groups {
          id
        }
      }
    }`;
    tester.test(true, query);
  });

  it('fail if a field doesn\'t exist', () => {
    const query = `{
      users  {
        id,
        SUPERfirebaseId,
        name,
        lastName,
        email,
        groups {
          id
        }
      }
    }`;
    tester.test(false, query);
  });

  it('fetch a user by ID', () => {
    // TODO
    // const query = `{
    //   getUser(id: "1") {
    //     id
    //     name
    //   }
    // }`;
  });
});
