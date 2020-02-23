const ListSection = {
  /* GET section's list */
  list: (parent, args, context) => context.prisma.listSection({ id: parent.id }).list(),
  lines: (parent, args, context) => context.prisma.listSetion({ id: parent.id }).lines(),
};

module.exports = { ListSection };
