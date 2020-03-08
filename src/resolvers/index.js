const { userMutation } = require('./Mutation/user');
const { groupMutation } = require('./Mutation/group');
const { addressMutation } = require('./Mutation/address');
const { invitationMutation } = require('./Mutation/invitation');
const { listMutation } = require('./Mutation/list');
const { listSectionMutation } = require('./Mutation/listSection');
const { listLineMutation } = require('./Mutation/listLine');

const { Query } = require('./Query');
const { User } = require('./User');
const { Group } = require('./Group');
const { Invitation } = require('./Invitation');
const { UserGroup } = require('./UserGroup');
const { List } = require('./List');
const { ListSection } = require('./ListSection');
const { ListLine } = require('./ListLine');

module.exports = {
  Query,
  Mutation: {
    ...userMutation,
    ...groupMutation,
    ...addressMutation,
    ...invitationMutation,
    ...listMutation,
    ...listSectionMutation,
    ...listLineMutation,
  },
  User,
  Group,
  UserGroup,
  Invitation,
  List,
  ListSection,
  ListLine,
};
