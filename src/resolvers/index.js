const { userMutations } = require('./Mutation/user.mutations');
const { groupMutations } = require('./Mutation/group.mutations');
const { addressMutations } = require('./Mutation/address.mutations');

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
