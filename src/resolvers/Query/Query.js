const { authenticate } = require('../../utils.js');

const Query = {
  /* verify if the user exist in the database */
  login: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.$exists.user({ firebaseId: res.uid });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return error;
    }
  },

  /* GET user by ID */
  user: (root, args, context) => context.prisma.user({ id: args.userId }),
  /* GET user by firebase ID */
  users: (root, args, context) => context.prisma.users(),
  /* GET user by firebase ID */
  userByFirebase: (root, args, context) => context.prisma.user({ firebaseId: args.firebaseId }),

  /* GET all groups */
  groups: (root, args, context) => context.prisma.groups(),
  /* GET group by id */
  group: (root, args, context) => context.prisma.group({ id: args.groupId }),

  /* GET all userTypes */
  userTypes: (root, args, context) => context.prisma.userTypes(),
  /* GET userType by id */
  userType: (root, args, context) => context.prisma.userType({ id: args.userTypeId }),

  /* GET all addresses */
  addresses: (root, args, context) => context.prisma.addresses(),
  /* GET single address by ID */
  address: (root, args, context) => context.prisma.address({ id: args.addressId }),

  /* GET all invitations */
  invitations: (root, args, context) => context.prisma.invitations(),
  /* GET single invitation by ID */
  invitation: (root, args, context) => context.prisma.invitation({ id: args.invitationId }),
  /* GET valid invitations for group */
  invitationsForGroup: (root, args, context) => context.prisma.invitations({
    where: {
      group: { id: args.groupId },
      role: { type: args.role },
    },
  }),
  /* Get all userGroups */
  userGroups: (root, args, context) => context.prisma.userGroups(),
  /* Get userGroup by ID */
  userGroup: (root, args, context) => context.prisma.userGroup({ id: args.userGroupId }),
  /* Get userGroup from a user ID */
  userGroupsByUserId: async (root, args, context) => {
    const res = await authenticate(context);
    // fetch user by uid
    const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);

    return context.prisma.userGroups({
      where: {
        user: { id: user.id },
      },
    });
  },
  /* Get userGroup by user and group IDs */
  userGroupByIds: (root, args, context) => context.prisma.userGroups({
    where: {
      user: { firebaseId: args.input.userId },
      group: { id: args.input.groupId },
    },
  }),

  userGroupByGroupId: (root, args, context) => context.prisma.userGroups({
    where: {
      group: { id: args.groupId },
    },
  }),

  /* Get all list for user */
  // eslint-disable-next-line max-len
  listsByGroup: (root, args, context) => context.prisma.group({ id: args.groupId }).lists(),

  list: (root, args, context) => context.prisma.list({ id: args.listId }),

  /* GET all breakNotices */
  breakNotices: (root, args, context) => context.prisma.breakNotices(),
  /* GET breakNotice by id */
  breakNotice: (root, args, context) => context.prisma.breakNotice({ id: args.breakNoticeId }),
  /* GET all breakNotices for group */
  breakNoticesByGroup: (root, args, context) => context.prisma.breakNotices({
    where: {
      group: { id: args.groupId },
    },
  }),
};

module.exports = { Query };
