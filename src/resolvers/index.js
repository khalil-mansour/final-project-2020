const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');
const { listMutation } = require('./Mutation/list');

const { Query } = require('./Query/Query');
const { listQuery } = require('./Query/list');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');
const { List } = require('./List');

module.exports = {
  Query: {
    ...Query,
    ...listQuery,
    ...transactionQuery,
  },
  Mutation: {
    ...userMutation,
    ...groupMutation,
    ...addressMutation,
    ...invitationMutation,
    ...listMutation,
  },
  User,
  Group,
  UserGroup,
  Invitation,
  List,
};
