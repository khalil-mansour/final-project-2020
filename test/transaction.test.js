
const fs = require('fs');
const path = require('path');
const EasyGraphQLTester = require('easygraphql-tester');

const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.graphql'), 'utf8');

describe('Transaction', () => {
  let tester;

  before(() => {
    tester = new EasyGraphQLTester(schema);
  });

  it('fetch a transaction by ID', () => {
    const query = `{
      transaction(transactionId: "1") {
        id
        paidBy {
          id
        }
        amount
        isPayback
        isEven
        description
        group {
          id
        }
        contributions {
          id
        }
        operationsHistoric {
          id
        }
        createdAt
        updatedAt
      }
    }`;

    tester.test(true, query);
  });

  it('fetch a transaction by ID with invalid field', () => {
    const query = `{
      transaction(transactionId: "1") {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch all transactions paid by a user for a group by group ID', () => {
    const query = `{
      userPaidTransactionsForGroup(groupId: "1") {
        id
        paidBy {
          id
        }
        amount
        isPayback
        isEven
        description
        group {
          id
        }
        contributions {
          id
        }
        operationsHistoric {
          id
        }
        createdAt
        updatedAt
      }
    }`;

    tester.test(true, query);
  });

  it('fetch all transactions paid by a user for a group by group ID with invalid field', () => {
    const query = `{
      userPaidTransactionsForGroup(groupId: "1") {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch all transactions related to a user of a group by group ID', () => {
    const query = `{
      groupTransactionsForUser(groupId: "1") {
        transactionBalanceAmount
        transaction {
          id
          amount
          description
          isPayback
          paidBy {
            firebaseId
            name
            lastName
          }
          contributions {
            user {
              firebaseId
            }
            amount
          }
          updatedAt
        }
      }
    }`;

    tester.test(true, query);
  });

  it('fetch all transactions related to a user of a group by group ID with invalid field', () => {
    const query = `{
      groupTransactionsForUser(groupId: "1") {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch all contributions related to a user of a group by group ID', () => {
    const query = `{
      groupContributionsForUser(groupId: "1") {
        id
        user {
          id
        }
        transaction {
          id
        }
        percentage
        amount
        createdAt
        updatedAt
      }
    }`;

    tester.test(true, query);
  });

  it('fetch all contributions related to a user of a group by group ID with invalid field', () => {
    const query = `{
      groupContributionsForUser(groupId: "1") {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch all contributions related to the connected user and another user of a group by group ID and user ID', () => {
    const query = `{
      groupContributionsForTwoUsers(input: { groupId: "1", otherUserId: "1" }) {
        id
        user {
          id
        }
        transaction {
          id
        }
        percentage
        amount
        createdAt
        updatedAt
      }
    }`;

    tester.test(true, query);
  });

  it('fetch all contributions related to the connected user and another user of a group by group ID and user ID with invalid field', () => {
    const query = `{
      groupContributionsForTwoUsers(input: { groupId: "1", otherUserId: "1" }) {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch all the operations made on every transactions related to a user at the moment of these operations for a group by group ID', () => {
    const query = `{
      groupTransactionsOperationsHistoric(groupId: "1") {
        id
        type {
          id
        }
        transaction {
          id
        }
        transactionDescription
        operationMadeByUser {
          id
        }
        concernedUsers {
          id
        }
        createdAt
      }
    }`;

    tester.test(true, query);
  });

  it('fetch all the operations made on every transactions related to a user at the moment of these operations for a group by group ID with invalid field', () => {
    const query = `{
      groupTransactionsOperationsHistoric(groupId: "1") {
        notValidField
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch the balances with every person of a group by group ID', () => {
    const query = `{
      allBalances(groupId: "1") {
        totalBalance
        userBalances {
          user {
            id
          }
          balance
        }
      }
    }`;

    tester.test(true, query);
  });

  it('fetch the balances with every person of a group by group ID with invalid field', () => {
    const query = `{
      allBalances(groupId: "1") {
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch the balances with every person of a group with unpaid amounts by group ID', () => {
    const query = `{
      unpaidBalances(groupId: "1") {
        totalBalance
        userBalances {
          user {
            id
          }
          balance
        }
      }
    }`;

    tester.test(true, query);
  });

  it('fetch the balances with every person of a group with unpaid amounts group ID with invalid field', () => {
    const query = `{
      unpaidBalances(groupId: "1") {
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch the balances whit every person of a group that owe you money by group ID', () => {
    const query = `{
      usersWhoOweYou(groupId: "1") {
        totalBalance
        userBalances {
          user {
            id
          }
          balance
        }
      }
    }`;

    tester.test(true, query);
  });

  it('fetch the balances whit every person of a group that owe you money by group ID with invalid field', () => {
    const query = `{
      usersWhoOweYou(groupId: "1") {
        id
      }
    }`;

    tester.test(false, query);
  });

  it('fetch the balances whit every person of a group that you owe money to by group ID', () => {
    const query = `{
      usersYouOweTo(groupId: "1") {
        totalBalance
        userBalances {
          user {
            id
          }
          balance
        }
      }
    }`;

    tester.test(true, query);
  });

  it('fetch the balances whit every person of a group that you owe money to by group ID with invalid field', () => {
    const query = `{
      usersYouOweTo(groupId: "1") {
        id
      }
    }`;

    tester.test(false, query);
  });

  // MUTATIONS
  it('create a new transaction', () => {
    const mutation = `
      mutation CreateTransaction {
        createTransaction (
          input: {
            paidById: "yaXRcIB3F5eUB94OOxfCDuCVl7O2"
            isEven: true
            amount: 85000
            description: "test de transaction 3"
            groupId: "ck6zhs0b1006p0715m27689wl"
            contributions: [
              {
                userId: "yaXRcIB3F5eUB94OOxfCDuCVl7O2"
                percentage: 50
              }
              {
                userId: "locataire2eUB94OOxfCDuCVl7O2"
                percentage: 25
              }
              {
                userId: "locataire3eUB94OOxfCDuCVl7O2"
                percentage: 25
              }
            ] 
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('delete a transaction', () => {
    const mutation = `
      mutation DeleteTransaction {
        deleteTransaction (
          input: {
            transactionId: "ck7dmwqus00n10815hnf4bd2i"
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('restore a deleted transaction', () => {
    const mutation = `
      mutation RestoreTransaction {
        restoreTransaction (
          input: {
            transactionId: "ck7dmwqus00n10815hnf4bd2i"
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('update a transaction completely', () => {
    const mutation = `
      mutation UpdateTransaction {
        updateTransaction (
          input: {
            transactionId: "ck7f99cyd000x0715pdnpmw39"
            paidById: "locataire2eUB94OOxfCDuCVl7O2"
            isEven: false
            amount: 1000000
            description: "test de transaction3"
            contributions: [
              {
                userId: "yaXRcIB3F5eUB94OOxfCDuCVl7O2"
                percentage: 70
              }
              {
                userId: "locataire2eUB94OOxfCDuCVl7O2"
                percentage: 30
              }
            ] 
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('update a transaction\'s description', () => {
    const mutation = `
      mutation UpdateTransactionDescription {
        updateTransactionDescription (
          input: {
            transactionId:"ck7f99cyd000x0715pdnpmw39"
            description: "a modified description 2"
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('pay back another user', () => {
    const mutation = `
      mutation PayBack {
        payBack (
          input: {
            payBackToUserId: "locataire2eUB94OOxfCDuCVl7O2"
            groupId: "ck6zhs0b1006p0715m27689wl"
            amount: 626500
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });

  it('update the amount of a payback', () => {
    const mutation = `
      mutation UpdatePaybackAmount {
        updatePaybackAmount (
          input: {
            transactionId:"ck7f99cyd000x0715pdnpmw39"
            amount: 424242
          }
        )
        {
          id
          paidBy {
            id
          }
          amount
          isPayback
          isEven
          description
          group {
            id
          }
          contributions {
            id
          }
          operationsHistoric {
            id
          }
          createdAt
          updatedAt
        }
      }
    `;

    tester.test(true, mutation);
  });
});
