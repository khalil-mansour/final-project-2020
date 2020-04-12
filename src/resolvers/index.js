const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { chat } = require('./Mutation/chat');
const { invitationMutation } = require('./Mutation/invitation');
const { transactionMutation } = require('./Mutation/transaction');
const { listMutation } = require('./Mutation/list');
const { breakNoticeMutation } = require('./Mutation/breakNotice');

const { Query } = require('./Query/Query');
const { listQuery } = require('./Query/List');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');

const { Chatroom } = require('./Chatroom');
const { Message } = require('./Message');
const { UserChatroom } = require('./UserChatroom');
const { Transaction } = require('./Transaction');
const { Contribution } = require('./Contribution');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');
const { List } = require('./List');
const { ListSection } = require('./ListSection');
const { ListLine } = require('./ListLine');
const { BreakNotice } = require('./BreakNotice');

const { userGroupSubscription } = require('./Subscription/userGroup');
const { breakNoticeSubscription } = require('./Subscription/breakNotice');
const { chatSubscription } = require('./Subscription/chat');
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
    ...chat,
    ...invitationMutation,
    ...transactionMutation,
    ...listMutation,
    ...breakNoticeMutation,
  },
  Subscription: {
    ...transactionSubscription,
    ...userGroupSubscription,
    ...chatSubscription,
    ...breakNoticeSubscription,
  },
  User,
  Group,
  Chatroom,
  Message,
  UserChatroom,
  UserGroup,
  Invitation,
  Transaction,
  Contribution,
  List,
  ListSection,
  ListLine,
  BreakNotice,
};
