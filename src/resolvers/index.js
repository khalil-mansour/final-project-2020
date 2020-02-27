const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');
const { transactionMutation } = require('./Mutation/transaction');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');
const { Transaction } = require('./Transaction');
const { Contribution } = require('./Contribution');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');

module.exports = {
  Query,
  Mutation: {
    ...userMutation,
    ...groupMutation,
    ...addressMutation,
    ...invitationMutation,
    ...transactionMutation,
  },
  User,
  Group,
  UserGroup,
  Invitation,
  Transaction,
  Contribution,
};
