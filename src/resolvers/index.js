const { userMutations } = require('./Mutation/user');
const { groupMutations } = require('./Mutation/group');
const { addressMutations } = require('./Mutation/address');
const { invitationMutations } = require('./Mutation/invitation');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');

module.exports = {
  Query,
  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...addressMutations,
    ...invitationMutations,
  },
  User,
  Group,
  UserGroup,
  Invitation,
};
