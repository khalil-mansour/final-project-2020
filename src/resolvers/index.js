const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');

const { Query } = require('./Query/Query');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');

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
  },
  User,
  Group,
  UserGroup,
  Invitation,
};
