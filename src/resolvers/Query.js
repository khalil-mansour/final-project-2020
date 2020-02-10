const Query = {

  /* GET all users */
  users: (root, args, context) => context.prisma.users(),

  /* GET user by ID */
  user: (root, args, context) => context.prisma.user({ id: args.id }),

  /* GET all groups */
  groups: (root, args, context) => context.prisma.groups(),

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

  /* GET all addresses */
  transactions: (root, args, context) => context.prisma.transactions(),

  /* GET single transaction by ID */
  transaction: (root, args, context) => context.prisma.transaction({ id: args.id }),

  /* GET all transactions paid by a user */
  userTransactions: (root, args, context) => context.prisma.transactions({ paidBy: { id: args.id } }),

  /* GET all transactions of a group */
  groupTransactions: (root, args, context) => context.prisma.transactions({ group: { id: args.id } }),

  /* GET all contributions */
  contributions: (root, args, context) => context.prisma.contributions(),

  /* GET single contribution by ID */
  contribution: (root, args, context) => context.prisma.contribution({ id: args.id }),

};

module.exports = { Query };
