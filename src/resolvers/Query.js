const { authenticate } = require('../utils.js');

const Query = {

  login: (root, args, context) => authenticate(context)
    .then((validatedUser) => context.prisma.$exists.user({ firebaseId: validatedUser.uid }))
    .catch((error) => {
      console.error(error);
      return error;
    }),
  /* GET user by ID */
  user: (root, args, context) => context.prisma.user({ id: args.userId }),
  /* GET user by firebase ID */
  users: (root, args, context) => context.prisma.users(),
  /* GET user by firebase ID */
  userByFirebase: (root, firebaseId, context) => context.prisma.user({ firebaseId }),

  /* GET all groups */
  groups: (parent, args, context) => context.prisma.groups(),
  /* GET group by id */
  group: (root, args, context) => context.prisma.group({ id: args.groupId }),

  /* GET all addresses */
  addresses: (root, args, context) => context.prisma.addresses(),
  /* GET single address by ID */
  address: (root, args, context) => context.prisma.address({ id: args.addressId }),

  /* GET all invitations */
  invitations: (root, args, context) => context.prisma.invitations(),
  /* GET single invitation by ID */
  invitation: (root, args, context) => context.prisma.invitation({ id: args.invitationId }),

  /* Get all userGroups */
  userGroups: (root, args, context) => context.prisma.userGroups(),
  /* Get userGroup by ID */
  userGroup: (root, args, context) => context.prisma.userGroup({ id: args.userGroupId }),
  /* Get userGroup by user and group IDs */
  userGroupByIds: (root, args, context) => context.prisma.userGroups({
    where: {
      user: { id: args.input.userId },
      group: { id: args.input.groupId },
    },
  }),
};

module.exports = { Query };
