const { authenticate } = require('../utils.js');

const Query = {

  /* GET all users */
  login: (root, args, context) => authenticate(context)
    .then((validatedUser) => context.prisma.$exists.user({ userId: validatedUser.uid }))
    .catch((error) => {
      console.error(error);
      return error;
    }),
  /* GET user by ID */
  user: (root, args, context) => context.prisma.user({ id: args.id }),
  /* GET user by firebase ID */
  user_by_uid: (root, args, context) => context.prisma.user({ userId: args.uid }),

  /* GET all groups */
  groups: (parent, args, context) => context.prisma.groups(),
  /* GET group by id */
  group: (root, args, context) => context.prisma.group({ id: args.id }),

  /* GET all addresses */
  addresses: (root, args, context) => context.prisma.addresses(),
  /* GET single address by ID */
  address: (root, args, context) => context.prisma.address({ id: args.id }),

  /* GET all invitations */
  invitations: (root, args, context) => context.prisma.invitations(),
  /* GET single invitation by ID */
  invitation: (root, args, context) => context.prisma.invitation({ id: args.id }),

  /* Get all userGroups */
  userGroups: (root, args, context) => context.prisma.userGroups(),
  /* Get userGroup by ID */
  userGroup: (root, args, context) => context.prisma.userGroup({ id: args.id }),
  /* Get userGroup by user and group IDs */
  userGroup_by_ids: (root, args, context) => context.prisma.userGroups({
    where: {
      user: {
        id: args.input.user,
      },
      group: {
        id: args.input.group,
      },
    },
  }),
};

module.exports = { Query };
