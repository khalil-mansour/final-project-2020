const { Query } = require('./Query');
const { auth } = require('./Mutation/auth');
const { chat } = require('./Mutation/chat');

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...chat,
  },
};
