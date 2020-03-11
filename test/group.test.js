const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('Group', () => {
  let tester;

  before(() => {
    tester = new EasyGraphQLTester(schema);
  });

  // QUERIES

  it('fetch all groups', () => {
    const query = `{
      groups {
        id
        name
        address {
          id
          country
          province
          city
        }
        admin {
          id
          firebaseId
          name
          lastName
          email
        }
        users {
          id
          user {
            id
            name
            lastName
            email
          }
          join_at
        }
      }
    }`;
    tester.test(true, query);
  });

  it('fail for non-existant field', () => {
    const query = `{
      groups {
        id
        name
        FALSEFIELD
      }
    }`;
    tester.test(false, query);
  });

  it('fetch a group by ID', () => {
    const query = `{
      group(groupId: "ck73us7zr00670783zs910jna") {
        id
        name
      }
    }`;
    tester.test(true, query);
  });

  it('fetch a group by ID with invalid field', () => {
    const query = `{
      group(groupId: "ck73us7zr00670783zs910jna") {
        id
        FALSEFIELD
      }
    }`;
    tester.test(false, query);
  });

  // MUTATIONS

  it('create a new group', () => {
    const mutation = `
      mutation CreateGroup {
        createGroup(input:{
          name: "test"
          addressId: "ck73uisy4005m0783ldqb9jon"
        }) {
          name
        }
      }`;
    tester.test(true, mutation);
  });

  it('delete group', () => {
    const mutation = `
      mutation DeleteGroup {
        deleteGroup(input :{
          groupId: "ck6ssmzax003w07156fpw2fab"
        }) {
          id
        }
      }`;
    tester.test(true, mutation);
  });

  it('remove user from group', () => {
    const mutation = `
      mutation RemoveUser {
        removeUserFromGroup(input: {
          userId: "ck6t35ouz00hm0715i5fezr8s"
          groupId: "ck6t2ccfl00eq0715deygqr0a"
        }) {
          id
          name
          users {
            id
          }
        }
      }`;
    tester.test(true, mutation);
  });

  it('leave group', () => {
    const mutation = `
      mutation LeaveGroup {
        leaveGroup(input: { groupId: "ck6t2ccfl00eq0715deygqr0a" }) {
          name
        }
      }`;
    tester.test(true, mutation);
  });


  // Change how update works first
  /*
  it('update group', () => {
    const mutation = `{

    }`
  })
  */
});
