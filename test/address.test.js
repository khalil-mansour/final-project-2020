const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('Address', () => {
  let tester;

  before(() => {
    tester = new EasyGraphQLTester(schema);
  });

  // QUERIES

  it('fetch all addresses', () => {
    const query = `{
      addresses {
        id
        country
        province
        city
        street
        apartmentUnit
        postalCode    
      }   
    }`;
    tester.test(true, query);
  });

  it('fail for non-existant field', () => {
    const query = `{
      addresses {
        id
        FALSEFIELD
      }      
    }`;
    tester.test(false, query);
  });

  it('fetch single address', () => {
    const query = `{
      address(addressId: "testID") {
        id
        country
        province
        city
      }      
    }`;
    tester.test(true, query);
  });

  // MUTATIONS

  it('update address', () => {
    const mutation = `
      mutation UpdateAddress {
        updateAddress(input:{
          addressId: "some test id"
          country: "USA"
          province: "TEXAS"
          city: "HOUSTON"
          street: "500 LAFLAME"
          postalCode: "J8R 2N6"
        }) {
          id
          country
          province
          city
          street
          postalCode
        }
      }`;
    tester.test(true, mutation);
  });
});
