const { userMutations } = require('./Mutation/user.mutation');

const { Query } = require('./Query');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
  },
};
