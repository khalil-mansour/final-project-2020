const { userMutations } = require('./Mutation/user');
const { groupMutations } = require('./Mutation/group');
const { addressMutations } = require('./Mutation/address');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...addressMutations,
  },
  User,
  Group,
};
