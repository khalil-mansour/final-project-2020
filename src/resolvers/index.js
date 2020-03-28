const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { chat } = require('./Mutation/chat');
const { invitationMutation } = require('./Mutation/invitation');
const { listMutation } = require('./Mutation/list');

const { Query } = require('./Query/Query');
const { listQuery } = require('./Query/List');
const { transactionQuery } = require('./Query/transaction');

const { User } = require('./User');
const { Group } = require('./Group');

const { Chatroom } = require('./Chatroom');
const { Message } = require('./Message');
const { UserChatroom } = require('./UserChatroom');

const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');
const { List } = require('./List');
const { ListSection } = require('./ListSection');
const { ListLine } = require('./ListLine');


const { chatSubscription } = require('./Subscription/chat');

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
    ...listMutation,
  },
  Subscription: {
    ...chatSubscription,
  },
  User,
  Group,
  Chatroom,
  Message,
  UserChatroom,
  UserGroup,
  Invitation,
  List,
  ListSection,
  ListLine,
};
