const { userMutations } = require('./Mutation/user');
const { groupMutations } = require('./Mutation/group');
const { addressMutations } = require('./Mutation/address');
const { chat } = require('./Mutation/chat');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');
const { Chatroom } = require('./Chatroom');
const { Message } = require('./Message');
const { UserChatroom } = require('./UserChatroom');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...addressMutations,
    ...chat,
  },
  User,
  Group,
  Chatroom,
  Message,
  UserChatroom,
};
