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
        }
        admin {
          id
        }
        users {
          id
        }
        invitations {
          id
        }
        lists {
          id
        }
        notices {
          id
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
          role: "landlord"
        }) {
          id
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
      mutation RemoveUsers {
        removeUsersFromGroup(input: {
          userIdArray: ["ck6t35ouz00hm0715i5fezr8s", "coco"]
          groupId: "ck6t2ccfl00eq0715deygqr0a"
        })
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


  it('update group', () => {
    const mutation = `
      mutation UpdateGroup {
        updateGroupInfo(input:{
          groupId:"ck8jkdqo800z60721henu34da"
          name: "Test2"
          address: {
            country: "Canada"
            province: "On"
            city: "ott"
            street: "rideau"
            apartmentUnit: "4"
            postalCode: "J8R4N3"
          }
        }) {
          id
          name
        }
      }`;
    tester.test(true, mutation);
  });
});
