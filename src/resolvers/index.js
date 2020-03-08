const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');
const { transactionMutation } = require('./Mutation/transaction');

const { Query } = require('./Query/Query');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');
const { Transaction } = require('./Transaction');
const { Contribution } = require('./Contribution');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');

const { transactionSubscription } = require('./Subscription/transaction');

module.exports = {
  Query: {
    ...Query,
    ...transactionQuery,
  },
  Mutation: {
    ...userMutation,
    ...groupMutation,
    ...addressMutation,
    ...invitationMutation,
    ...transactionMutation,
  },
  Subscription: {
    ...transactionSubscription,
  },
  User,
  Group,
  UserGroup,
  Invitation,
  Transaction,
  Contribution,
};
