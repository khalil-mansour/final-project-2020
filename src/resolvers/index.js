const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { chat } = require('./Mutation/chat');
const { invitationMutation } = require('./Mutation/invitation');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');

const { Chatroom } = require('./Chatroom');
const { Message } = require('./Message');
const { UserChatroom } = require('./UserChatroom');

const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');

const { chatSubscription } = require('./Subscription/chat');

module.exports = {
  Query,
  Mutation: {
    ...userMutation,
    ...groupMutation,
    ...addressMutation,
    ...chat,
    ...invitationMutation,
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
};
