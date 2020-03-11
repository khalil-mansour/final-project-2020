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
      query {
        addresses {
          id
          country
          province
          city
          street
          apartment_unit
        }
      }
    }`;
    tester.test(true, query);
  });

  it('fail for non-existant field', () => {
    const query =  `{
      query {
        addresses {
          id
          FALSEFIELD
        }
      }
    }`;
    tester.test(false, query);
  });

  it('fetch single address', () => {
    const query = `{
      query {
        address(addressId: "testID") {
          id
          country
          province
          city
        }
      }
    }`;
    tester.test(true, query);
  });

  // MUTATIONS

  it('create address', () => {
    const mutation = `{
      mutation {
        createAddress(input:{
          country: "Canada"
          province:"QC"
          city:"Gtown"
          street: "toto"
          apartment_unit: 6
        }) {
          id
          country
          province
          city
          street
          apartment_unit
        }
      }
    }`;
    tester.test(true, mutation);
  });

  it('update address', () => {
    const mutation = `{
      mutation {
        updateAddress(input:{
          addressId: "some test id"
          country: "USA"
          province: "TEXAS"
          city: "HOUSTON"
          street: "500 LAFLAME"
        }) {
          id
          country
          province
          city
          street
        }
      }
    }`;
    tester.test(true, mutation);
  });
  
});