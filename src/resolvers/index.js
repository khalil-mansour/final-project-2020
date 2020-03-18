const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');
const { transactionMutation } = require('./Mutation/transaction');
const { listMutation } = require('./Mutation/list');

const { Query } = require('./Query/Query');
const { listQuery } = require('./Query/List');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');
const { Transaction } = require('./Transaction');
const { Contribution } = require('./Contribution');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');
const { List } = require('./List');
const { ListSection } = require('./ListSection');
const { ListLine } = require('./ListLine');


const { transactionSubscription } = require('./Subscription/transaction');

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
    ...transactionMutation,
    ...listMutation,
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
  List,
  ListSection,
  ListLine,
};
