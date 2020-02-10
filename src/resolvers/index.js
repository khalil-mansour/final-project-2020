const { userMutations } = require('./Mutation/user');
const { groupMutations } = require('./Mutation/group');
const { addressMutations } = require('./Mutation/address');
const { transactionMutations } = require('./Mutation/transaction');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');
const { Transaction } = require('./Transaction');
const { Contribution } = require('./Contribution');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...addressMutations,
    ...transactionMutations,
  },
  User,
  Group,
  Transaction,
  Contribution,
};
